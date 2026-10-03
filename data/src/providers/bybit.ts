import type { FreshObservation } from "../types.js";
import { asRecord, fetchJson } from "./http.js";

export function parseBybitTicker(payload: unknown): FreshObservation {
  const body = asRecord(payload);
  if (body.retCode !== 0 || typeof body.time !== "number") {
    throw new Error("bybit ticker is missing a response clock");
  }
  const result = asRecord(body.result);
  const list = result.list;
  const row = Array.isArray(list) ? asRecord(list[0]) : undefined;
  if (!row || typeof row.lastPrice !== "string") {
    throw new Error("bybit ticker is missing lastPrice");
  }
  return {
    provider: "bybit",
    price: row.lastPrice,
    observedAt: new Date(body.time).toISOString(),
    timeField: "time",
  };
}

export async function fetchBybit(
  market: string,
  fetchImpl: typeof fetch,
): Promise<FreshObservation> {
  const payload = await fetchJson(
    `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${market}`,
    fetchImpl,
  );
  return parseBybitTicker(payload);
}
