import { readFileSync } from "node:fs";

import { MemoryReadModel } from "./memory.js";
import { NETWORK_NOTE, type NodeRecord, type RequestRecord } from "./types.js";

type SnapshotFile = {
  checkpoint?: { lastProcessedSlot: string | null; updatedAt: string | null };
  requests?: Array<Record<string, string | number | null>>;
  nodes?: Array<Record<string, string | number | null>>;
  registry?: Record<string, string | number | boolean | null> | null;
  protocol?: Record<string, string | number | boolean | null> | null;
  results?: Array<Record<string, string | null>>;
};

function str(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

function opt(value: string | number | null | undefined): string | null {
  return value === null || value === undefined || value === "" ? null : String(value);
}

export function readSnapshotModel(path: string): MemoryReadModel | null {
  let parsed: SnapshotFile;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8")) as SnapshotFile;
  } catch {
    return null;
  }
  const results = new Map(
    (parsed.results ?? []).map((row) => [
      String(row.requestId ?? ""),
      { node: String(row.node ?? ""), outputHex: String(row.outputHex ?? "") },
    ]),
  );
  const requests: RequestRecord[] = (parsed.requests ?? []).map((row) => ({
    id: str(row.id),
    jobType: str(row.jobType),
    status: str(row.status),
    requester: str(row.requester),
    callback: opt(row.callback),
    maxFee: str(row.maxFee ?? "0"),
    createdSlot: str(row.createdSlot),
    expiresSlot: str(row.expiresSlot ?? "0"),
    assignedNode: opt(row.assignedNode),
    assignedStake: opt(row.assignedStake),
    assignedHeartbeat: opt(row.assignedHeartbeat),
    updatedSlot: str(row.updatedSlot),
    result: results.get(str(row.id)) ?? null,
  }));
  const nodes: NodeRecord[] = (parsed.nodes ?? []).map((row) => ({
    id: str(row.id),
    authority: str(row.authority),
    operator: str(row.operator),
    vrfPubkey: opt(row.vrfPubkey),
    stakeLamports: str(row.stakeLamports ?? "0"),
    jobMask: Number(row.jobMask ?? 0),
    status: str(row.status),
    reputation: str(row.reputation ?? "0"),
    createdSlot: str(row.createdSlot),
    lastHeartbeat: opt(row.lastHeartbeat),
    cooldownEndSlot: opt(row.cooldownEndSlot),
    updatedSlot: str(row.updatedSlot),
  }));
  const registry = parsed.registry
    ? {
        id: str(parsed.registry.id as string),
        nodeCount: str(parsed.registry.nodeCount as string),
        minStake: str(parsed.registry.minStake as string),
        unstakeCooldownSlots: str(parsed.registry.unstakeCooldownSlots as string),
        heartbeatTimeoutSlots: str(parsed.registry.heartbeatTimeoutSlots as string),
      }
    : null;
  const protocol = parsed.protocol
    ? {
        id: str(parsed.protocol.id as string),
        authority: str(parsed.protocol.authority as string),
        paused: Boolean(parsed.protocol.paused),
      }
    : null;
  return new MemoryReadModel(requests, nodes, {
    registry,
    protocol,
    checkpoint: parsed.checkpoint ?? { lastProcessedSlot: null, updatedAt: null },
    note: NETWORK_NOTE,
  });
}
