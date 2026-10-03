import { describe, expect, it } from "vitest";

import { aggregatePrices } from "./aggregate.js";
import { median } from "./aggregation/median.js";
import { formatDecimal, parseDecimal } from "./decimal.js";
import { normalizeSymbol, UnknownSymbolError } from "./normalization/symbols.js";
import { parseBinanceTicker } from "./providers/binance.js";
import { parseBybitTicker } from "./providers/bybit.js";
import { parseCoinbaseTicker } from "./providers/coinbase.js";
import { parseKrakenTrades } from "./providers/kraken.js";
import { parsePythLatest } from "./providers/pyth.js";
import { classifyAge } from "./validation/staleness.js";

const NOW = Date.parse("2026-10-03T09:13:36.000Z");

describe("price aggregation", () => {
  it("normalizes USD aliases and keeps USDT separate", () => {
    expect(normalizeSymbol("sol").symbol).toBe("SOL/USD");
    expect(normalizeSymbol("SOLUSDT").symbol).toBe("SOL/USDT");
    expect(() => normalizeSymbol("DOGE")).toThrow(UnknownSymbolError);
  });

  it("drops stale observations and refuses a short median", () => {
    expect(classifyAge(NOW - 120_000, NOW, 60_000)).toBe("stale");
    expect(classifyAge(NOW + 60_000, NOW, 60_000)).toBe("ahead");
    expect(median([parseDecimal("10"), parseDecimal("30"), parseDecimal("20")])).toBe(
      parseDecimal("20"),
    );
    expect(formatDecimal(median([parseDecimal("10"), parseDecimal("11")]))).toBe("10.5");
  });

  it("parses provider payloads without inventing a missing field", () => {
    expect(
      parseCoinbaseTicker({ price: "119.43", time: "2026-10-03T09:13:36.529543472Z" }).price,
    ).toBe("119.43");
    expect(
      parseKrakenTrades({
        error: [],
        result: { SOLUSD: [["119.44", "1", NOW / 1000, "s", "l", ""]] },
      }).provider,
    ).toBe("kraken");
    expect(parseBinanceTicker({ lastPrice: "119.45", closeTime: NOW }).timeField).toBe("closeTime");
    expect(
      parseBybitTicker({ retCode: 0, time: NOW, result: { list: [{ lastPrice: "119.46" }] } })
        .price,
    ).toBe("119.46");
    expect(
      parsePythLatest({
        parsed: [{ price: { price: "11943000000", expo: -8, publish_time: NOW / 1000 } }],
      }).price,
    ).toBe("119.43");
    expect(() => parsePythLatest({ parsed: [] })).toThrow(/missing price/);
  });

  it("returns a USD median from fresh sources and records a failed one", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("coinbase")) {
        return json({ price: "100", time: "2026-10-03T09:13:36.000Z" });
      }
      if (url.includes("kraken")) {
        return json({ error: [], result: { SOLUSD: [["110", "1", NOW / 1000, "s", "l", ""]] } });
      }
      if (url.includes("pyth")) {
        return new Response("unauthorized", { status: 401 });
      }
      throw new Error(`unexpected ${url}`);
    };
    const result = await aggregatePrices({
      symbol: "SOL/USD",
      nowMs: NOW,
      fetchImpl,
    });
    expect(result).toMatchObject({
      authority: "none",
      symbol: "SOL/USD",
      quote: "USD",
      median: "105",
      sufficient: true,
    });
    expect(result.fresh.map((row) => row.provider).sort()).toEqual(["coinbase", "kraken"]);
    expect(result.rejected).toEqual([{ provider: "pyth", reason: "HTTP 401" }]);
  });

  it("does not invent a median when only one source is fresh", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("binance")) {
        return json({ lastPrice: "100", closeTime: NOW });
      }
      return json({ retCode: 0, time: NOW - 120_000, result: { list: [{ lastPrice: "90" }] } });
    };
    const result = await aggregatePrices({ symbol: "SOL/USDT", nowMs: NOW, fetchImpl });
    expect(result.median).toBeNull();
    expect(result.sufficient).toBe(false);
    expect(result.fresh).toHaveLength(1);
    expect(result.rejected[0]?.reason).toBe("stale");
  });
});

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
