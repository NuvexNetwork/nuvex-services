import type {
  Checkpoint,
  NodeRow,
  ProtocolRow,
  ReadModelSnapshot,
  RegistryRow,
  RequestRow,
  ResultRow,
} from "./types.js";

export class MemoryStore {
  requests = new Map<string, RequestRow>();
  nodes = new Map<string, NodeRow>();
  results = new Map<string, ResultRow>();
  registry: RegistryRow | null = null;
  protocol: ProtocolRow | null = null;
  checkpoint: Checkpoint = {
    lastProcessedSlot: null,
    lastProcessedSignature: null,
    updatedAt: null,
  };

  upsertRequest(row: RequestRow): void {
    this.requests.set(row.id, row);
  }

  upsertNode(row: NodeRow): void {
    this.nodes.set(row.id, row);
  }

  upsertResult(row: ResultRow): void {
    this.results.set(row.requestId, row);
  }

  setRegistry(row: RegistryRow): void {
    this.registry = row;
  }

  setProtocol(row: ProtocolRow): void {
    this.protocol = row;
  }

  setCheckpoint(slot: bigint, signature: string | null = null): void {
    this.checkpoint = {
      lastProcessedSlot: slot,
      lastProcessedSignature: signature,
      updatedAt: new Date().toISOString(),
    };
  }

  snapshot(): ReadModelSnapshot {
    return {
      checkpoint: { ...this.checkpoint },
      requests: [...this.requests.values()].sort((a, b) =>
        a.createdSlot === b.createdSlot
          ? a.id.localeCompare(b.id)
          : Number(b.createdSlot - a.createdSlot),
      ),
      nodes: [...this.nodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
      registry: this.registry,
      protocol: this.protocol,
      results: [...this.results.values()].sort((a, b) => a.requestId.localeCompare(b.requestId)),
    };
  }
}
