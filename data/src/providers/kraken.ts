import type { FreshObservation } from "../types.js";
import { asRecord, fetchJson } from "./http.js";

export function parseKrakenTrades(payload: unknown): FreshObservation {
  const body = asRecord(payload);
  const errors = body.error;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error("kraken returned an error");
  }
  const result = asRecord(body.result);
  for (const [key, value] of Object.entries(result)) {
    if (key === "last" || !Array.isArray(value) || !Array.isArray(value[0])) continue;
    const trade = value[0] as unknown[];
    const price = trade[0];
    const time = trade[2];
    if (typeof price !== "string" || typeof time !== "number") {
      throw new Error("kraken trade is missing price or time");
    }
    return {
      provider: "kraken",
      price,
      observedAt: new Date(Math.floor(time * 1000)).toISOString(),
      timeField: "trade time",
    };
  }
  throw new Error("kraken returned no trade");
}

export async function fetchKraken(
  pair: string,
  fetchImpl: typeof fetch,
): Promise<FreshObservation> {
  const payload = await fetchJson(
    `https://api.kraken.com/0/public/Trades?pair=${pair}&count=1`,
    fetchImpl,
  );
  return parseKrakenTrades(payload);
}
