import { median } from "./aggregation/median.js";
import { formatDecimal, parseDecimal } from "./decimal.js";
import { normalizeSymbol } from "./normalization/symbols.js";
import { fetchBinance } from "./providers/binance.js";
import { fetchBybit } from "./providers/bybit.js";
import { fetchCoinbase } from "./providers/coinbase.js";
import { fetchKraken } from "./providers/kraken.js";
import { fetchPyth } from "./providers/pyth.js";
import {
  PRICE_NOTE,
  type FreshObservation,
  type PriceAggregate,
  type RejectedObservation,
} from "./types.js";
import { classifyAge, readPriceQuery } from "./validation/staleness.js";

export type AggregateInput = {
  symbol: string;
  maxAgeMs?: number;
  minimumSources?: number;
  nowMs?: number;
  fetchImpl?: typeof fetch;
};

export async function aggregatePrices(input: AggregateInput): Promise<PriceAggregate> {
  const symbol = normalizeSymbol(input.symbol);
  const query = readPriceQuery(input);
  const nowMs = input.nowMs ?? Date.now();
  const fetchImpl = input.fetchImpl ?? fetch;
  const calls: Array<
    Promise<{ provider: string; observation?: FreshObservation; reason?: string }>
  > = [];
  const attempt = (provider: string, call: Promise<FreshObservation>) =>
    call
      .then((observation) => ({ provider, observation }))
      .catch((error: unknown) => ({ provider, reason: errorMessage(error) }));
  if (symbol.coinbase) calls.push(attempt("coinbase", fetchCoinbase(symbol.coinbase, fetchImpl)));
  if (symbol.kraken) calls.push(attempt("kraken", fetchKraken(symbol.kraken, fetchImpl)));
  if (symbol.pyth) calls.push(attempt("pyth", fetchPyth(symbol.pyth, fetchImpl)));
  if (symbol.binance) calls.push(attempt("binance", fetchBinance(symbol.binance, fetchImpl)));
  if (symbol.bybit) calls.push(attempt("bybit", fetchBybit(symbol.bybit, fetchImpl)));

  const settled = await Promise.all(calls);
  const fresh: FreshObservation[] = [];
  const rejected: RejectedObservation[] = [];
  for (const item of settled) {
    if (!item.observation) {
      rejected.push({ provider: item.provider, reason: item.reason ?? "provider failed" });
      continue;
    }
    const age = classifyAge(Date.parse(item.observation.observedAt), nowMs, query.maxAgeMs);
    if (age !== "fresh") {
      rejected.push({ provider: item.provider, reason: age });
      continue;
    }
    try {
      parseDecimal(item.observation.price);
    } catch (error) {
      rejected.push({ provider: item.provider, reason: errorMessage(error) });
      continue;
    }
    fresh.push(item.observation);
  }

  const sufficient = fresh.length >= query.minimumSources;
  return {
    authority: "none",
    source: "providers",
    symbol: symbol.symbol,
    quote: symbol.quote,
    median: sufficient ? formatDecimal(median(fresh.map((row) => parseDecimal(row.price)))) : null,
    sufficient,
    minimumSources: query.minimumSources,
    maxAgeMs: query.maxAgeMs,
    fresh,
    rejected,
    note: PRICE_NOTE,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "provider failed";
}
