import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { applyAccounts } from "./apply.js";
import { readIndexerConfig } from "./config.js";
import { encodeBase58 } from "./decoders/base58.js";
import { encodeNodeAccount, encodeOracleRequest, pubkeyBytes } from "./decoders/fixtures.js";
import { missingTables, readSchema } from "./database/schema-check.js";
import { run } from "./index.js";
import { processTransaction } from "./processors/events.js";
import { MemoryStore } from "./store/memory.js";
import { toJsonSnapshot, writeSnapshot } from "./store/snapshot.js";

describe("indexer", () => {
  it("declares every read-model table", () => {
    expect(missingTables(readSchema())).toEqual([]);
  });

  it("refuses to start without RPC or a persist target", async () => {
    const previous = { ...process.env };
    delete process.env.NUVEX_RPC_URL;
    delete process.env.NUVEX_SOLANA_RPC_URL;
    delete process.env.NUVEX_ORACLE_CORE_PROGRAM_ID;
    delete process.env.DATABASE_URL;
    delete process.env.NUVEX_READ_MODEL_PATH;
    expect(await run(["start"])).toBe(2);
    expect(processTransaction().applied).toBe(false);
    process.env = previous;
  });

  it("answers health without a slot cursor", async () => {
    expect(await run(["--health"])).toBe(0);
  });

  it("applies decoded accounts and can write a snapshot", () => {
    const store = new MemoryStore();
    const nodeKey = encodeBase58(pubkeyBytes(8));
    applyAccounts(
      store,
      [
        { pubkey: "req1", data: encodeOracleRequest({ status: 2, createdSlot: 3n }) },
        {
          pubkey: "node1",
          data: encodeNodeAccount({ authority: pubkeyBytes(2), status: 2, stake: 50n }),
        },
        { pubkey: "noise", data: Buffer.from("xxxx") },
      ],
      44n,
    );
    const snapshot = store.snapshot();
    expect(snapshot.requests).toHaveLength(1);
    expect(snapshot.nodes[0]).toMatchObject({ id: "node1", status: "Active", stakeLamports: 50n });
    expect(snapshot.nodes[0]?.authority).toBe(encodeBase58(pubkeyBytes(2)));
    expect(snapshot.checkpoint.lastProcessedSlot).toBe(44n);
    expect(nodeKey).toBeTruthy();

    const dir = mkdtempSync(join(tmpdir(), "nuvex-read-model-"));
    const path = join(dir, "snapshot.json");
    writeSnapshot(path, snapshot);
    const written = JSON.parse(readFileSync(path, "utf8")) as { requests: unknown[] };
    expect(written.requests).toHaveLength(1);
    expect(toJsonSnapshot(snapshot).requests[0]?.status).toBe("Pending");
  });

  it("names the required indexer environment", () => {
    const { missing } = readIndexerConfig({});
    expect(missing).toContain("NUVEX_RPC_URL");
    expect(missing).toContain("program ids");
  });
});
