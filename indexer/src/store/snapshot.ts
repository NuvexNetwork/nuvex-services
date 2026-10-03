import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import type { JsonSnapshot, ReadModelSnapshot } from "./types.js";

function bigintToString(value: bigint | null | undefined): string | null {
  return value === null || value === undefined ? null : value.toString();
}

export function toJsonSnapshot(model: ReadModelSnapshot): JsonSnapshot {
  return {
    checkpoint: {
      lastProcessedSlot: bigintToString(model.checkpoint.lastProcessedSlot),
      lastProcessedSignature: model.checkpoint.lastProcessedSignature,
      updatedAt: model.checkpoint.updatedAt,
    },
    requests: model.requests.map((row) => ({
      id: row.id,
      jobType: row.jobType,
      status: row.status,
      requester: row.requester,
      callback: row.callback,
      maxFee: row.maxFee.toString(),
      createdSlot: row.createdSlot.toString(),
      expiresSlot: row.expiresSlot.toString(),
      assignedNode: row.assignedNode,
      assignedStake: bigintToString(row.assignedStake),
      assignedHeartbeat: bigintToString(row.assignedHeartbeat),
      updatedSlot: row.updatedSlot.toString(),
    })),
    nodes: model.nodes.map((row) => ({
      id: row.id,
      authority: row.authority,
      operator: row.operator,
      vrfPubkey: row.vrfPubkey,
      stakeLamports: row.stakeLamports.toString(),
      jobMask: row.jobMask,
      status: row.status,
      reputation: row.reputation.toString(),
      createdSlot: row.createdSlot.toString(),
      lastHeartbeat: bigintToString(row.lastHeartbeat),
      cooldownEndSlot: bigintToString(row.cooldownEndSlot),
      updatedSlot: row.updatedSlot.toString(),
    })),
    registry: model.registry
      ? {
          id: model.registry.id,
          authority: model.registry.authority,
          nodeCount: model.registry.nodeCount.toString(),
          minStake: model.registry.minStake.toString(),
          unstakeCooldownSlots: model.registry.unstakeCooldownSlots.toString(),
          heartbeatTimeoutSlots: model.registry.heartbeatTimeoutSlots.toString(),
          slashAuthority: model.registry.slashAuthority,
          slashDestination: model.registry.slashDestination,
          updatedSlot: model.registry.updatedSlot.toString(),
        }
      : null,
    protocol: model.protocol
      ? {
          id: model.protocol.id,
          authority: model.protocol.authority,
          paused: model.protocol.paused,
          updatedSlot: model.protocol.updatedSlot.toString(),
        }
      : null,
    results: model.results.map((row) => ({
      id: row.id,
      requestId: row.requestId,
      node: row.node,
      outputHex: row.outputHex,
      slot: row.slot.toString(),
    })),
  };
}

export function writeSnapshot(path: string, model: ReadModelSnapshot): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(toJsonSnapshot(model), null, 2)}\n`);
}

export function readJsonSnapshot(path: string): JsonSnapshot | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as JsonSnapshot;
  } catch {
    return null;
  }
}
