import { describe, expect, it } from "vitest";

import { median } from "./aggregation/median.js";
import { fetchTicker as fetchBinance } from "./providers/binance.js";
import { fetchTicker as fetchBybit } from "./providers/bybit.js";
import { fetchTicker as fetchCoinbase } from "./providers/coinbase.js";
import { fetchTicker as fetchKraken } from "./providers/kraken.js";
import { fetchPrice as fetchPyth } from "./providers/pyth.js";
import { ProviderNotImplementedError } from "./providers/errors.js";

describe("market data providers", () => {
  it("do not return prices", async () => {
    const calls = [fetchBinance(), fetchCoinbase(), fetchKraken(), fetchBybit(), fetchPyth()];
    for (const call of calls) {
      await expect(call).rejects.toBeInstanceOf(ProviderNotImplementedError);
    }
    expect(() => median()).toThrow(/not implemented/);
  });
});
