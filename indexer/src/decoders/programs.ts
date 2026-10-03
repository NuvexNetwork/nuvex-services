import { createHash } from "node:crypto";

import { encodeBase58 } from "./base58.js";

export const PROGRAM_NAMES = ["oracle_core", "oracle_registry", "verification"] as const;

export const REQUEST_ID_LEN = 32;
export const MAX_INPUT_LEN = 256;
export const MAX_CALLBACK_DATA_LEN = 128;
export const VRF_PUBLIC_KEY_LEN = 32;
export const VRF_OUTPUT_LEN = 64;
export const VRF_PROOF_LEN = 80;
export const DISCRIMINATOR_LEN = 8;

/** Solana default pubkey (32 zero bytes). */
export const DEFAULT_PUBKEY = "11111111111111111111111111111111";

export const REQUEST_MIN_LEN =
  DISCRIMINATOR_LEN +
  32 +
  1 +
  1 +
  8 +
  8 +
  8 +
  REQUEST_ID_LEN +
  2 +
  MAX_INPUT_LEN +
  32 +
  2 +
  MAX_CALLBACK_DATA_LEN +
  1 +
  32 +
  8 +
  8;

export const NODE_MIN_LEN =
  DISCRIMINATOR_LEN + 32 + 32 + VRF_PUBLIC_KEY_LEN + 8 + 4 + 1 + 8 + 8 + 8 + 1 + 8;

export const REGISTRY_MIN_LEN = DISCRIMINATOR_LEN + 32 + 8 + 1 + 8 + 8 + 8 + 32 + 32;

export const PROTOCOL_MIN_LEN = DISCRIMINATOR_LEN + 32 + 1 + 1;

export const VRF_RESULT_MIN_LEN =
  DISCRIMINATOR_LEN + 32 + 32 + VRF_PUBLIC_KEY_LEN + VRF_OUTPUT_LEN + VRF_PROOF_LEN + 1;

const REQUEST_STATUS: Record<number, string> = {
  1: "Created",
  2: "Pending",
  3: "Assigned",
  4: "Computing",
  5: "Submitted",
  6: "Verifying",
  7: "Finalized",
  8: "CallbackExecuted",
  9: "Cancelled",
  10: "Expired",
  11: "Rejected",
  12: "Failed",
  13: "Challenged",
};

const JOB_TYPE: Record<number, string> = {
  1: "Vrf",
  2: "Price",
  3: "Data",
  4: "Compute",
  5: "AiInference",
};

const NODE_STATUS: Record<number, string> = {
  1: "Registered",
  2: "Active",
  3: "Unstaking",
};

export type DecodedAccount =
  | { kind: "request"; account: DecodedRequest }
  | { kind: "node"; account: DecodedNode }
  | { kind: "registry"; account: DecodedRegistry }
  | { kind: "protocol"; account: DecodedProtocol }
  | { kind: "vrf_result"; account: DecodedVrfResult };

export type DecodedRequest = {
  pubkey: string;
  requester: string;
  jobType: string;
  status: string;
  maxFee: bigint;
  createdSlot: bigint;
  expiresSlot: bigint;
  callbackProgram: string | null;
  assignedNode: string | null;
  assignedStake: bigint | null;
  assignedHeartbeat: bigint | null;
};

export type DecodedNode = {
  pubkey: string;
  authority: string;
  operator: string;
  vrfPubkey: string | null;
  stakeLamports: bigint;
  jobMask: number;
  status: string;
  reputation: bigint;
  createdSlot: bigint;
  lastHeartbeat: bigint;
  cooldownEndSlot: bigint;
};

export type DecodedRegistry = {
  pubkey: string;
  authority: string;
  nodeCount: bigint;
  minStake: bigint;
  unstakeCooldownSlots: bigint;
  heartbeatTimeoutSlots: bigint;
  slashAuthority: string | null;
  slashDestination: string | null;
};

export type DecodedProtocol = {
  pubkey: string;
  authority: string;
  paused: boolean;
};

export type DecodedVrfResult = {
  pubkey: string;
  request: string;
  node: string;
  outputHex: string;
};

export function accountDiscriminator(name: string): Buffer {
  return createHash("sha256").update(`account:${name}`).digest().subarray(0, DISCRIMINATOR_LEN);
}

export const DISC = {
  OracleRequest: accountDiscriminator("OracleRequest"),
  ProtocolConfig: accountDiscriminator("ProtocolConfig"),
  NodeAccount: accountDiscriminator("NodeAccount"),
  NodeRegistry: accountDiscriminator("NodeRegistry"),
  VrfResult: accountDiscriminator("VrfResult"),
};

export function optionalPubkey(value: string): string | null {
  return value === DEFAULT_PUBKEY ? null : value;
}

function readPubkey(data: Buffer, offset: number): { value: string; next: number } {
  return { value: encodeBase58(data.subarray(offset, offset + 32)), next: offset + 32 };
}

function readU64(data: Buffer, offset: number): { value: bigint; next: number } {
  return { value: data.readBigUInt64LE(offset), next: offset + 8 };
}

function hasDisc(data: Buffer, expected: Buffer): boolean {
  return data.length >= DISCRIMINATOR_LEN && data.subarray(0, DISCRIMINATOR_LEN).equals(expected);
}

export function decoderAvailable(program: (typeof PROGRAM_NAMES)[number]): boolean {
  return PROGRAM_NAMES.includes(program);
}

export function decodeAccount(pubkey: string, data: Buffer): DecodedAccount | null {
  if (hasDisc(data, DISC.OracleRequest)) {
    const request = decodeRequest(pubkey, data);
    return request ? { kind: "request", account: request } : null;
  }
  if (hasDisc(data, DISC.NodeAccount)) {
    const node = decodeNode(pubkey, data);
    return node ? { kind: "node", account: node } : null;
  }
  if (hasDisc(data, DISC.NodeRegistry)) {
    const registry = decodeRegistry(pubkey, data);
    return registry ? { kind: "registry", account: registry } : null;
  }
  if (hasDisc(data, DISC.ProtocolConfig)) {
    const protocol = decodeProtocol(pubkey, data);
    return protocol ? { kind: "protocol", account: protocol } : null;
  }
  if (hasDisc(data, DISC.VrfResult)) {
    const result = decodeVrfResult(pubkey, data);
    return result ? { kind: "vrf_result", account: result } : null;
  }
  return null;
}

export function decodeRequest(pubkey: string, data: Buffer): DecodedRequest | null {
  if (!hasDisc(data, DISC.OracleRequest) || data.length < REQUEST_MIN_LEN) return null;
  let o = DISCRIMINATOR_LEN;
  const requester = readPubkey(data, o);
  o = requester.next;
  const jobType = JOB_TYPE[data[o]!] ?? `unknown:${data[o]}`;
  o += 1;
  const status = REQUEST_STATUS[data[o]!] ?? `unknown:${data[o]}`;
  o += 1;
  const maxFee = readU64(data, o);
  o = maxFee.next;
  const createdSlot = readU64(data, o);
  o = createdSlot.next;
  const expiresSlot = readU64(data, o);
  o = expiresSlot.next;
  o += REQUEST_ID_LEN;
  o += 2 + MAX_INPUT_LEN;
  const callback = readPubkey(data, o);
  o = callback.next;
  o += 2 + MAX_CALLBACK_DATA_LEN;
  o += 1;
  const assignedNode = readPubkey(data, o);
  o = assignedNode.next;
  const assignedStake = readU64(data, o);
  o = assignedStake.next;
  const assignedHeartbeat = readU64(data, o);
  const node = optionalPubkey(assignedNode.value);
  return {
    pubkey,
    requester: requester.value,
    jobType,
    status,
    maxFee: maxFee.value,
    createdSlot: createdSlot.value,
    expiresSlot: expiresSlot.value,
    callbackProgram: optionalPubkey(callback.value),
    assignedNode: node,
    assignedStake: node === null ? null : assignedStake.value,
    assignedHeartbeat: node === null ? null : assignedHeartbeat.value,
  };
}

export function decodeNode(pubkey: string, data: Buffer): DecodedNode | null {
  if (!hasDisc(data, DISC.NodeAccount) || data.length < NODE_MIN_LEN) return null;
  let o = DISCRIMINATOR_LEN;
  const authority = readPubkey(data, o);
  o = authority.next;
  const operator = readPubkey(data, o);
  o = operator.next;
  const vrfPubkey = encodeBase58(data.subarray(o, o + VRF_PUBLIC_KEY_LEN));
  o += VRF_PUBLIC_KEY_LEN;
  const stake = readU64(data, o);
  o = stake.next;
  const jobMask = data.readUInt32LE(o);
  o += 4;
  const status = NODE_STATUS[data[o]!] ?? `unknown:${data[o]}`;
  o += 1;
  const reputation = readU64(data, o);
  o = reputation.next;
  const createdSlot = readU64(data, o);
  o = createdSlot.next;
  const lastHeartbeat = readU64(data, o);
  o = lastHeartbeat.next;
  o += 1;
  const cooldown = readU64(data, o);
  return {
    pubkey,
    authority: authority.value,
    operator: operator.value,
    vrfPubkey: optionalPubkey(vrfPubkey),
    stakeLamports: stake.value,
    jobMask,
    status,
    reputation: reputation.value,
    createdSlot: createdSlot.value,
    lastHeartbeat: lastHeartbeat.value,
    cooldownEndSlot: cooldown.value,
  };
}

export function decodeRegistry(pubkey: string, data: Buffer): DecodedRegistry | null {
  if (!hasDisc(data, DISC.NodeRegistry) || data.length < REGISTRY_MIN_LEN) return null;
  let o = DISCRIMINATOR_LEN;
  const authority = readPubkey(data, o);
  o = authority.next;
  const nodeCount = readU64(data, o);
  o = nodeCount.next;
  o += 1;
  const minStake = readU64(data, o);
  o = minStake.next;
  const cooldown = readU64(data, o);
  o = cooldown.next;
  const heartbeat = readU64(data, o);
  o = heartbeat.next;
  const slashAuthority = readPubkey(data, o);
  o = slashAuthority.next;
  const slashDestination = readPubkey(data, o);
  return {
    pubkey,
    authority: authority.value,
    nodeCount: nodeCount.value,
    minStake: minStake.value,
    unstakeCooldownSlots: cooldown.value,
    heartbeatTimeoutSlots: heartbeat.value,
    slashAuthority: optionalPubkey(slashAuthority.value),
    slashDestination: optionalPubkey(slashDestination.value),
  };
}

export function decodeProtocol(pubkey: string, data: Buffer): DecodedProtocol | null {
  if (!hasDisc(data, DISC.ProtocolConfig) || data.length < PROTOCOL_MIN_LEN) return null;
  let o = DISCRIMINATOR_LEN;
  const authority = readPubkey(data, o);
  o = authority.next;
  const paused = data[o] !== 0;
  return { pubkey, authority: authority.value, paused };
}

export function decodeVrfResult(pubkey: string, data: Buffer): DecodedVrfResult | null {
  if (!hasDisc(data, DISC.VrfResult) || data.length < VRF_RESULT_MIN_LEN) return null;
  let o = DISCRIMINATOR_LEN;
  const request = readPubkey(data, o);
  o = request.next;
  const node = readPubkey(data, o);
  o = node.next;
  o += VRF_PUBLIC_KEY_LEN;
  const outputHex = data.subarray(o, o + VRF_OUTPUT_LEN).toString("hex");
  return { pubkey, request: request.value, node: node.value, outputHex };
}
