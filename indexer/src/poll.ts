import { applyAccounts } from "./apply.js";
import type { IndexerConfig } from "./config.js";
import { getProgramAccounts, getSlot } from "./rpc/client.js";
import { MemoryStore } from "./store/memory.js";
import { persistSnapshot } from "./store/postgres.js";
import { writeSnapshot } from "./store/snapshot.js";

export async function pollOnce(store: MemoryStore, config: IndexerConfig): Promise<void> {
  const slot = await getSlot(config.rpcUrl);
  const accounts = (
    await Promise.all(
      config.programIds.map((programId) => getProgramAccounts(config.rpcUrl, programId)),
    )
  ).flat();
  applyAccounts(store, accounts, slot);
  const snapshot = store.snapshot();
  if (config.snapshotPath) {
    writeSnapshot(config.snapshotPath, snapshot);
  }
  if (config.databaseUrl) {
    await persistSnapshot(config.databaseUrl, snapshot);
  }
}
