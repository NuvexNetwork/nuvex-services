import { readJsonSnapshot } from "../store/snapshot.js";

export interface Checkpoint {
  lastProcessedSlot: bigint | null;
  lastProcessedSignature: string | null;
}

export function checkpointStatus(): Checkpoint {
  const path = process.env.NUVEX_READ_MODEL_PATH?.trim();
  if (!path) {
    return { lastProcessedSlot: null, lastProcessedSignature: null };
  }
  const snapshot = readJsonSnapshot(path);
  if (!snapshot) {
    return { lastProcessedSlot: null, lastProcessedSignature: null };
  }
  return {
    lastProcessedSlot:
      snapshot.checkpoint.lastProcessedSlot === null
        ? null
        : BigInt(snapshot.checkpoint.lastProcessedSlot),
    lastProcessedSignature: snapshot.checkpoint.lastProcessedSignature,
  };
}
