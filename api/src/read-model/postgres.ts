import pg from "pg";

import {
  NETWORK_NOTE,
  type NetworkRecord,
  type NodeRecord,
  type ReadModel,
  type RequestRecord,
} from "./types.js";

const { Pool } = pg;

type RequestRow = {
  id: string;
  job_type: string;
  status: string;
  requester: string;
  callback: string | null;
  max_fee: string;
  created_slot: string;
  expires_slot: string;
  assigned_node: string | null;
  assigned_stake: string | null;
  assigned_heartbeat: string | null;
  updated_slot: string;
  result_node: string | null;
  result_output: string | null;
};

type NodeRow = {
  id: string;
  authority: string;
  operator: string;
  vrf_pubkey: string | null;
  stake_lamports: string;
  job_mask: number;
  status: string;
  reputation: string;
  created_slot: string;
  last_heartbeat: string | null;
  cooldown_end_slot: string | null;
  updated_slot: string;
};

export class PostgresReadModel implements ReadModel {
  available = true;
  private readonly pool: pg.Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({ connectionString: databaseUrl });
  }

  async listRequests(): Promise<RequestRecord[]> {
    const result = await this.pool.query<RequestRow>(
      `SELECT r.id, r.job_type, r.status, r.requester, r.callback, r.max_fee::text, r.created_slot::text,
              r.expires_slot::text, r.assigned_node, r.assigned_stake::text, r.assigned_heartbeat::text,
              r.updated_slot::text, res.node_id AS result_node, res.output_hex AS result_output
         FROM requests r
    LEFT JOIN results res ON res.request_id = r.id
     ORDER BY r.created_slot DESC, r.id`,
    );
    return result.rows.map(mapRequest);
  }

  async getRequest(id: string): Promise<RequestRecord | null> {
    const result = await this.pool.query<RequestRow>(
      `SELECT r.id, r.job_type, r.status, r.requester, r.callback, r.max_fee::text, r.created_slot::text,
              r.expires_slot::text, r.assigned_node, r.assigned_stake::text, r.assigned_heartbeat::text,
              r.updated_slot::text, res.node_id AS result_node, res.output_hex AS result_output
         FROM requests r
    LEFT JOIN results res ON res.request_id = r.id
        WHERE r.id = $1`,
      [id],
    );
    const row = result.rows[0];
    return row ? mapRequest(row) : null;
  }

  async listNodes(): Promise<NodeRecord[]> {
    const result = await this.pool.query<NodeRow>(
      `SELECT id, authority, operator, vrf_pubkey, stake_lamports::text, job_mask, status, reputation::text,
              created_slot::text, last_heartbeat::text, cooldown_end_slot::text, updated_slot::text
         FROM nodes
     ORDER BY id`,
    );
    return result.rows.map((row) => ({
      id: row.id,
      authority: row.authority,
      operator: row.operator,
      vrfPubkey: row.vrf_pubkey,
      stakeLamports: row.stake_lamports,
      jobMask: row.job_mask,
      status: row.status,
      reputation: row.reputation,
      createdSlot: row.created_slot,
      lastHeartbeat: row.last_heartbeat,
      cooldownEndSlot: row.cooldown_end_slot,
      updatedSlot: row.updated_slot,
    }));
  }

  async network(): Promise<NetworkRecord> {
    const [requests, nodes, registry, protocol, checkpoint] = await Promise.all([
      this.pool.query<{ status: string; n: string }>(
        "SELECT status, count(*)::text AS n FROM requests GROUP BY status",
      ),
      this.pool.query<{ status: string; n: string }>(
        "SELECT status, count(*)::text AS n FROM nodes GROUP BY status",
      ),
      this.pool.query<{
        id: string;
        node_count: string;
        min_stake: string;
        unstake_cooldown_slots: string;
        heartbeat_timeout_slots: string;
      }>(
        "SELECT id, node_count::text, min_stake::text, unstake_cooldown_slots::text, heartbeat_timeout_slots::text FROM registry LIMIT 1",
      ),
      this.pool.query<{ id: string; authority: string; paused: boolean }>(
        "SELECT id, authority, paused FROM protocol LIMIT 1",
      ),
      this.pool.query<{ last_processed_slot: string | null; updated_at: Date | null }>(
        "SELECT last_processed_slot::text, updated_at FROM checkpoints WHERE id = 'default'",
      ),
    ]);
    const requestCounts = Object.fromEntries(
      requests.rows.map((row) => [row.status, Number(row.n)]),
    );
    const nodeCounts = Object.fromEntries(nodes.rows.map((row) => [row.status, Number(row.n)]));
    const registryRow = registry.rows[0];
    const protocolRow = protocol.rows[0];
    const checkpointRow = checkpoint.rows[0];
    return {
      authority: "none",
      source: "read-model",
      requests: {
        total: Object.values(requestCounts).reduce((sum, n) => sum + n, 0),
        byStatus: requestCounts,
      },
      nodes: {
        total: Object.values(nodeCounts).reduce((sum, n) => sum + n, 0),
        byStatus: nodeCounts,
      },
      registry: registryRow
        ? {
            id: registryRow.id,
            nodeCount: registryRow.node_count,
            minStake: registryRow.min_stake,
            unstakeCooldownSlots: registryRow.unstake_cooldown_slots,
            heartbeatTimeoutSlots: registryRow.heartbeat_timeout_slots,
          }
        : null,
      protocol: protocolRow
        ? { id: protocolRow.id, authority: protocolRow.authority, paused: protocolRow.paused }
        : null,
      checkpoint: {
        lastProcessedSlot: checkpointRow?.last_processed_slot ?? null,
        updatedAt: checkpointRow?.updated_at ? checkpointRow.updated_at.toISOString() : null,
      },
      note: NETWORK_NOTE,
    };
  }
}

function mapRequest(row: RequestRow): RequestRecord {
  return {
    id: row.id,
    jobType: row.job_type,
    status: row.status,
    requester: row.requester,
    callback: row.callback,
    maxFee: row.max_fee,
    createdSlot: row.created_slot,
    expiresSlot: row.expires_slot,
    assignedNode: row.assigned_node,
    assignedStake: row.assigned_stake,
    assignedHeartbeat: row.assigned_heartbeat,
    updatedSlot: row.updated_slot,
    result:
      row.result_node && row.result_output
        ? { node: row.result_node, outputHex: row.result_output }
        : null,
  };
}
