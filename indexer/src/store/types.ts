export type Checkpoint = {
  lastProcessedSlot: bigint | null;
  lastProcessedSignature: string | null;
  updatedAt: string | null;
};

export type RequestRow = {
  id: string;
  jobType: string;
  status: string;
  requester: string;
  callback: string | null;
  maxFee: bigint;
  createdSlot: bigint;
  expiresSlot: bigint;
  assignedNode: string | null;
  assignedStake: bigint | null;
  assignedHeartbeat: bigint | null;
  updatedSlot: bigint;
};

export type NodeRow = {
  id: string;
  authority: string;
  operator: string;
  vrfPubkey: string | null;
  stakeLamports: bigint;
  jobMask: number;
  status: string;
  reputation: bigint;
  createdSlot: bigint;
  lastHeartbeat: bigint | null;
  cooldownEndSlot: bigint | null;
  updatedSlot: bigint;
};

export type RegistryRow = {
  id: string;
  authority: string;
  nodeCount: bigint;
  minStake: bigint;
  unstakeCooldownSlots: bigint;
  heartbeatTimeoutSlots: bigint;
  slashAuthority: string | null;
  slashDestination: string | null;
  updatedSlot: bigint;
};

export type ProtocolRow = {
  id: string;
  authority: string;
  paused: boolean;
  updatedSlot: bigint;
};

export type ResultRow = {
  id: string;
  requestId: string;
  node: string;
  outputHex: string;
  slot: bigint;
};

export type ReadModelSnapshot = {
  checkpoint: Checkpoint;
  requests: RequestRow[];
  nodes: NodeRow[];
  registry: RegistryRow | null;
  protocol: ProtocolRow | null;
  results: ResultRow[];
};

export type JsonSnapshot = {
  checkpoint: {
    lastProcessedSlot: string | null;
    lastProcessedSignature: string | null;
    updatedAt: string | null;
  };
  requests: Array<Record<string, string | number | null>>;
  nodes: Array<Record<string, string | number | null>>;
  registry: Record<string, string | number | boolean | null> | null;
  protocol: Record<string, string | number | boolean | null> | null;
  results: Array<Record<string, string | null>>;
};
