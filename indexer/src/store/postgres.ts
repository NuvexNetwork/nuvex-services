import pg from "pg";

import type { ReadModelSnapshot } from "./types.js";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(databaseUrl: string): pg.Pool {
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/** Replace indexed rows with the latest account snapshot. Empty is a valid result. */
export async function persistSnapshot(
  databaseUrl: string,
  model: ReadModelSnapshot,
): Promise<void> {
  const client = await getPool(databaseUrl).connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM results");
    await client.query("DELETE FROM verifications");
    await client.query("DELETE FROM requests");
    await client.query("DELETE FROM nodes");
    await client.query("DELETE FROM registry");
    await client.query("DELETE FROM protocol");

    for (const row of model.requests) {
      await client.query(
        `INSERT INTO requests (
           id, job_type, status, requester, callback, max_fee, created_slot, expires_slot,
           assigned_node, assigned_stake, assigned_heartbeat, updated_slot
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          row.id,
          row.jobType,
          row.status,
          row.requester,
          row.callback,
          row.maxFee.toString(),
          row.createdSlot.toString(),
          row.expiresSlot.toString(),
          row.assignedNode,
          row.assignedStake === null ? null : row.assignedStake.toString(),
          row.assignedHeartbeat === null ? null : row.assignedHeartbeat.toString(),
          row.updatedSlot.toString(),
        ],
      );
    }

    for (const row of model.nodes) {
      await client.query(
        `INSERT INTO nodes (
           id, authority, operator, vrf_pubkey, stake_lamports, job_mask, status, reputation,
           created_slot, last_heartbeat, cooldown_end_slot, updated_slot
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          row.id,
          row.authority,
          row.operator,
          row.vrfPubkey,
          row.stakeLamports.toString(),
          row.jobMask,
          row.status,
          row.reputation.toString(),
          row.createdSlot.toString(),
          row.lastHeartbeat === null ? null : row.lastHeartbeat.toString(),
          row.cooldownEndSlot === null ? null : row.cooldownEndSlot.toString(),
          row.updatedSlot.toString(),
        ],
      );
    }

    if (model.registry) {
      const row = model.registry;
      await client.query(
        `INSERT INTO registry (
           id, authority, node_count, min_stake, unstake_cooldown_slots, heartbeat_timeout_slots,
           slash_authority, slash_destination, updated_slot
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          row.id,
          row.authority,
          row.nodeCount.toString(),
          row.minStake.toString(),
          row.unstakeCooldownSlots.toString(),
          row.heartbeatTimeoutSlots.toString(),
          row.slashAuthority,
          row.slashDestination,
          row.updatedSlot.toString(),
        ],
      );
    }

    if (model.protocol) {
      const row = model.protocol;
      await client.query(
        `INSERT INTO protocol (id, authority, paused, updated_slot) VALUES ($1,$2,$3,$4)`,
        [row.id, row.authority, row.paused, row.updatedSlot.toString()],
      );
    }

    const requestIds = new Set(model.requests.map((row) => row.id));
    for (const row of model.results) {
      if (!requestIds.has(row.requestId)) continue;
      await client.query(
        `INSERT INTO results (id, request_id, slot, commitment, node_id, output_hex)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [row.id, row.requestId, row.slot.toString(), row.outputHex, row.node, row.outputHex],
      );
      await client.query(
        `INSERT INTO verifications (id, request_id, status, slot, node_id, output_hex)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [row.id, row.requestId, "Submitted", row.slot.toString(), row.node, row.outputHex],
      );
    }

    await client.query(
      `INSERT INTO checkpoints (id, last_processed_slot, last_processed_signature, updated_at)
       VALUES ('default', $1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         last_processed_slot = EXCLUDED.last_processed_slot,
         last_processed_signature = EXCLUDED.last_processed_signature,
         updated_at = EXCLUDED.updated_at`,
      [
        model.checkpoint.lastProcessedSlot === null
          ? null
          : model.checkpoint.lastProcessedSlot.toString(),
        model.checkpoint.lastProcessedSignature,
        model.checkpoint.updatedAt ?? new Date().toISOString(),
      ],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
