import {
  NETWORK_NOTE,
  type NetworkRecord,
  type NodeRecord,
  type ReadModel,
  type RequestRecord,
} from "./types.js";

export class MemoryReadModel implements ReadModel {
  available = true;

  constructor(
    private readonly requests: RequestRecord[] = [],
    private readonly nodes: NodeRecord[] = [],
    private readonly extra?: Partial<NetworkRecord>,
  ) {}

  async listRequests(): Promise<RequestRecord[]> {
    return this.requests;
  }

  async getRequest(id: string): Promise<RequestRecord | null> {
    return this.requests.find((row) => row.id === id) ?? null;
  }

  async listNodes(): Promise<NodeRecord[]> {
    return this.nodes;
  }

  async network(): Promise<NetworkRecord> {
    return {
      authority: "none",
      source: "read-model",
      requests: countBy(this.requests.map((row) => row.status)),
      nodes: countBy(this.nodes.map((row) => row.status)),
      registry: this.extra?.registry ?? null,
      protocol: this.extra?.protocol ?? null,
      checkpoint: this.extra?.checkpoint ?? { lastProcessedSlot: null, updatedAt: null },
      note: NETWORK_NOTE,
    };
  }
}

function countBy(values: string[]): { total: number; byStatus: Record<string, number> } {
  const byStatus: Record<string, number> = {};
  for (const value of values) {
    byStatus[value] = (byStatus[value] ?? 0) + 1;
  }
  return { total: values.length, byStatus };
}

export const unavailableReadModel: ReadModel = {
  available: false,
  async listRequests() {
    return [];
  },
  async getRequest() {
    return null;
  },
  async listNodes() {
    return [];
  },
  async network() {
    return {
      authority: "none",
      source: "read-model",
      requests: { total: 0, byStatus: {} },
      nodes: { total: 0, byStatus: {} },
      registry: null,
      protocol: null,
      checkpoint: { lastProcessedSlot: null, updatedAt: null },
      note: NETWORK_NOTE,
    };
  },
};
