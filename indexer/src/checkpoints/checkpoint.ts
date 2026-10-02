export interface Checkpoint {
  lastProcessedSlot: bigint | null;
  lastProcessedSignature: string | null;
}

export function checkpointStatus(): Checkpoint {
  return {
    lastProcessedSlot: null,
    lastProcessedSignature: null,
  };
}
