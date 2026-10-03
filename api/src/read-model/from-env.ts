import { unavailableReadModel } from "./memory.js";
import { PostgresReadModel } from "./postgres.js";
import { readSnapshotModel } from "./snapshot.js";
import type { ReadModel } from "./types.js";

export function readModelFromEnv(env: NodeJS.ProcessEnv = process.env): ReadModel {
  const databaseUrl = env.DATABASE_URL?.trim();
  if (databaseUrl) {
    return new PostgresReadModel(databaseUrl);
  }
  const snapshotPath = env.NUVEX_READ_MODEL_PATH?.trim();
  if (snapshotPath) {
    return readSnapshotModel(snapshotPath) ?? unavailableReadModel;
  }
  return unavailableReadModel;
}
