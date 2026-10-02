export interface ProcessResult {
  applied: false;
  reason: string;
}

export function processTransaction(): ProcessResult {
  return {
    applied: false,
    reason: "Transaction processing starts in Milestone 4.",
  };
}
