import {
  DISC,
  MAX_CALLBACK_DATA_LEN,
  MAX_INPUT_LEN,
  REQUEST_ID_LEN,
  VRF_OUTPUT_LEN,
  VRF_PROOF_LEN,
  VRF_PUBLIC_KEY_LEN,
} from "./programs.js";

export function pubkeyBytes(fill: number): Buffer {
  return Buffer.alloc(32, fill);
}

function writeU64(target: Buffer, offset: number, value: bigint): number {
  target.writeBigUInt64LE(value, offset);
  return offset + 8;
}

export function encodeOracleRequest(fields: {
  requester?: Buffer;
  jobType?: number;
  status?: number;
  maxFee?: bigint;
  createdSlot?: bigint;
  expiresSlot?: bigint;
  callbackProgram?: Buffer;
  assignedNode?: Buffer;
  assignedStake?: bigint;
  assignedHeartbeat?: bigint;
}): Buffer {
  const data = Buffer.alloc(
    DISC.OracleRequest.length +
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
      8,
  );
  let o = 0;
  DISC.OracleRequest.copy(data, o);
  o += 8;
  (fields.requester ?? pubkeyBytes(1)).copy(data, o);
  o += 32;
  data[o++] = fields.jobType ?? 1;
  data[o++] = fields.status ?? 2;
  o = writeU64(data, o, fields.maxFee ?? 0n);
  o = writeU64(data, o, fields.createdSlot ?? 10n);
  o = writeU64(data, o, fields.expiresSlot ?? 20n);
  o += REQUEST_ID_LEN;
  o += 2 + MAX_INPUT_LEN;
  (fields.callbackProgram ?? Buffer.alloc(32)).copy(data, o);
  o += 32;
  o += 2 + MAX_CALLBACK_DATA_LEN;
  o += 1;
  (fields.assignedNode ?? Buffer.alloc(32)).copy(data, o);
  o += 32;
  o = writeU64(data, o, fields.assignedStake ?? 0n);
  writeU64(data, o, fields.assignedHeartbeat ?? 0n);
  return data;
}

export function encodeNodeAccount(fields: {
  authority?: Buffer;
  operator?: Buffer;
  vrfPubkey?: Buffer;
  stake?: bigint;
  jobMask?: number;
  status?: number;
  reputation?: bigint;
  createdSlot?: bigint;
  lastHeartbeat?: bigint;
  cooldownEndSlot?: bigint;
}): Buffer {
  const data = Buffer.alloc(
    DISC.NodeAccount.length + 32 + 32 + VRF_PUBLIC_KEY_LEN + 8 + 4 + 1 + 8 + 8 + 8 + 1 + 8,
  );
  let o = 0;
  DISC.NodeAccount.copy(data, o);
  o += 8;
  (fields.authority ?? pubkeyBytes(2)).copy(data, o);
  o += 32;
  (fields.operator ?? pubkeyBytes(3)).copy(data, o);
  o += 32;
  (fields.vrfPubkey ?? pubkeyBytes(4)).copy(data, o);
  o += VRF_PUBLIC_KEY_LEN;
  o = writeU64(data, o, fields.stake ?? 1_000_000n);
  data.writeUInt32LE(fields.jobMask ?? 1, o);
  o += 4;
  data[o++] = fields.status ?? 2;
  o = writeU64(data, o, fields.reputation ?? 3n);
  o = writeU64(data, o, fields.createdSlot ?? 5n);
  o = writeU64(data, o, fields.lastHeartbeat ?? 9n);
  o += 1;
  writeU64(data, o, fields.cooldownEndSlot ?? 0n);
  return data;
}

export function encodeNodeRegistry(fields: {
  authority?: Buffer;
  nodeCount?: bigint;
  minStake?: bigint;
  unstakeCooldownSlots?: bigint;
  heartbeatTimeoutSlots?: bigint;
}): Buffer {
  const data = Buffer.alloc(DISC.NodeRegistry.length + 32 + 8 + 1 + 8 + 8 + 8 + 32 + 32);
  let o = 0;
  DISC.NodeRegistry.copy(data, o);
  o += 8;
  (fields.authority ?? pubkeyBytes(5)).copy(data, o);
  o += 32;
  o = writeU64(data, o, fields.nodeCount ?? 1n);
  o += 1;
  o = writeU64(data, o, fields.minStake ?? 100n);
  o = writeU64(data, o, fields.unstakeCooldownSlots ?? 64n);
  o = writeU64(data, o, fields.heartbeatTimeoutSlots ?? 128n);
  Buffer.alloc(32).copy(data, o);
  o += 32;
  Buffer.alloc(32).copy(data, o);
  return data;
}

export function encodeProtocolConfig(fields: { authority?: Buffer; paused?: boolean }): Buffer {
  const data = Buffer.alloc(DISC.ProtocolConfig.length + 32 + 1 + 1);
  let o = 0;
  DISC.ProtocolConfig.copy(data, o);
  o += 8;
  (fields.authority ?? pubkeyBytes(6)).copy(data, o);
  o += 32;
  data[o] = fields.paused ? 1 : 0;
  return data;
}

export function encodeVrfResult(fields: {
  request?: Buffer;
  node?: Buffer;
  output?: Buffer;
}): Buffer {
  const data = Buffer.alloc(
    DISC.VrfResult.length + 32 + 32 + VRF_PUBLIC_KEY_LEN + VRF_OUTPUT_LEN + VRF_PROOF_LEN + 1,
  );
  let o = 0;
  DISC.VrfResult.copy(data, o);
  o += 8;
  (fields.request ?? pubkeyBytes(7)).copy(data, o);
  o += 32;
  (fields.node ?? pubkeyBytes(8)).copy(data, o);
  o += 32;
  o += VRF_PUBLIC_KEY_LEN;
  (fields.output ?? Buffer.alloc(VRF_OUTPUT_LEN, 9)).copy(data, o);
  return data;
}
