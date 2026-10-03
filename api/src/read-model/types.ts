export type RequestRecord = {
  id: string;
  jobType: string;
  status: string;
  requester: string;
  callback: string | null;
  maxFee: string;
  createdSlot: string;
  expiresSlot: string;
  assignedNode: string | null;
  assignedStake: string | null;
  assignedHeartbeat: string | null;
  updatedSlot: string;
  result: { node: string; outputHex: string } | null;
};

export type NodeRecord = {
  id: string;
  authority: string;
  operator: string;
  vrfPubkey: string | null;
  stakeLamports: string;
  jobMask: number;
  status: string;
  reputation: string;
  createdSlot: string;
  lastHeartbeat: string | null;
  cooldownEndSlot: string | null;
  updatedSlot: string;
};

export type NetworkRecord = {
  authority: "none";
  source: "read-model";
  requests: { total: number; byStatus: Record<string, number> };
  nodes: { total: number; byStatus: Record<string, number> };
  registry: {
    id: string;
    nodeCount: string;
    minStake: string;
    unstakeCooldownSlots: string;
    heartbeatTimeoutSlots: string;
  } | null;
  protocol: { id: string; authority: string; paused: boolean } | null;
  checkpoint: { lastProcessedSlot: string | null; updatedAt: string | null };
  note: string;
};

export type ReadModel = {
  available: boolean;
  listRequests(): Promise<RequestRecord[]>;
  getRequest(id: string): Promise<RequestRecord | null>;
  listNodes(): Promise<NodeRecord[]>;
  network(): Promise<NetworkRecord>;
};

export const NETWORK_NOTE = "Not protocol truth. Chain accounts remain authoritative.";
