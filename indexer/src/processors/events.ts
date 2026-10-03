export interface ProcessResult {
  applied: false;
  reason: string;
}

/** Transaction logs are not replayed. The indexer applies account snapshots. */
export function processTransaction(): ProcessResult {
  return {
    applied: false,
    reason: "The indexer applies getProgramAccounts snapshots. It does not replay transactions.",
  };
}
