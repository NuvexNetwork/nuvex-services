import { describe, expect, it } from "vitest";

import { missingTables, readSchema } from "./database/schema-check.js";
import { run } from "./index.js";
import { processTransaction } from "./processors/events.js";

describe("indexer", () => {
  it("declares every read-model table", () => {
    expect(missingTables(readSchema())).toEqual([]);
  });

  it("refuses to index", () => {
    expect(run(["start"])).toBe(2);
    expect(processTransaction().applied).toBe(false);
  });

  it("answers health without a slot cursor", () => {
    expect(run(["--health"])).toBe(0);
  });
});
