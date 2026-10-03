import type { FreshObservation } from "../types.js";
import { asRecord, fetchJson } from "./http.js";

export function parseBinanceTicker(payload: unknown): FreshObservation {
  const body = asRecord(payload);
  if (typeof body.lastPrice !== "string" || typeof body.closeTime !== "number") {
    throw new Error("binance ticker is missing lastPrice or closeTime");
  }
  return {
    provider: "binance",
    price: body.lastPrice,
    observedAt: new Date(body.closeTime).toISOString(),
    timeField: "closeTime",
  };
}

export async function fetchBinance(
  market: string,
  fetchImpl: typeof fetch,
): Promise<FreshObservation> {
  const payload = await fetchJson(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${market}`,
    fetchImpl,
  );
  return parseBinanceTicker(payload);
}
