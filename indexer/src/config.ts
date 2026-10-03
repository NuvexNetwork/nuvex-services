export type IndexerConfig = {
  rpcUrl: string;
  programIds: string[];
  databaseUrl: string | null;
  snapshotPath: string | null;
  pollMs: number;
  once: boolean;
};

export function readIndexerConfig(env: NodeJS.ProcessEnv = process.env): {
  config: IndexerConfig | null;
  missing: string[];
} {
  const rpcUrl = env.NUVEX_RPC_URL?.trim() || env.NUVEX_SOLANA_RPC_URL?.trim() || null;
  const programIds = [
    env.NUVEX_ORACLE_CORE_PROGRAM_ID?.trim(),
    env.NUVEX_ORACLE_REGISTRY_PROGRAM_ID?.trim(),
    env.NUVEX_VERIFICATION_PROGRAM_ID?.trim(),
  ].filter((value): value is string => Boolean(value));
  const databaseUrl = env.DATABASE_URL?.trim() || null;
  const snapshotPath = env.NUVEX_READ_MODEL_PATH?.trim() || null;
  const pollMs = Number(env.NUVEX_INDEXER_POLL_MS ?? "5000");
  const once = env.NUVEX_INDEXER_ONCE === "1";

  const missing: string[] = [];
  if (!rpcUrl) missing.push("NUVEX_RPC_URL");
  if (programIds.length === 0) missing.push("program ids");
  if (!databaseUrl && !snapshotPath) missing.push("DATABASE_URL or NUVEX_READ_MODEL_PATH");

  if (missing.length > 0) {
    return { config: null, missing };
  }

  return {
    config: {
      rpcUrl: rpcUrl!,
      programIds,
      databaseUrl,
      snapshotPath,
      pollMs: Number.isFinite(pollMs) && pollMs >= 200 ? pollMs : 5000,
      once,
    },
    missing,
  };
}

export function configFromEnv(): ReturnType<typeof readIndexerConfig> {
  return readIndexerConfig();
}
