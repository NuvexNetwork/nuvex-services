import type { FreshObservation } from "../types.js";
import { asRecord, fetchJson, parseProviderTime } from "./http.js";

export function parseCoinbaseTicker(payload: unknown): FreshObservation {
  const body = asRecord(payload);
  if (typeof body.price !== "string" || typeof body.time !== "string") {
    throw new Error("coinbase ticker is missing price or time");
  }
  return {
    provider: "coinbase",
    price: body.price,
    observedAt: new Date(parseProviderTime(body.time)).toISOString(),
    timeField: "time",
  };
}

export async function fetchCoinbase(
  market: string,
  fetchImpl: typeof fetch,
): Promise<FreshObservation> {
  const payload = await fetchJson(
    `https://api.exchange.coinbase.com/products/${market}/ticker`,
    fetchImpl,
  );
  return parseCoinbaseTicker(payload);
}
