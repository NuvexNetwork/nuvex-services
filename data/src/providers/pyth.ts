import type { FreshObservation } from "../types.js";
import { formatDecimal, parseDecimal } from "../decimal.js";
import { asRecord, fetchJson } from "./http.js";

export function parsePythLatest(payload: unknown): FreshObservation {
  const body = asRecord(payload);
  const parsed = body.parsed;
  const first = Array.isArray(parsed) ? parsed[0] : undefined;
  if (typeof first !== "object" || first === null) {
    throw new Error("pyth update is missing price or expo");
  }
  const row = asRecord(first);
  const price = asRecord(row.price);
  if (typeof price.price !== "string" || typeof price.expo !== "number") {
    throw new Error("pyth update is missing price or expo");
  }
  if (typeof price.publish_time !== "number") {
    throw new Error("pyth update is missing publish_time");
  }
  const scaled = parseDecimal(pythToDecimal(price.price, price.expo));
  return {
    provider: "pyth",
    price: formatDecimal(scaled),
    observedAt: new Date(price.publish_time * 1000).toISOString(),
    timeField: "publish_time",
  };
}

function pythToDecimal(price: string, expo: number): string {
  if (!/^-?\d+$/.test(price)) {
    throw new Error("pyth price is not an integer");
  }
  if (price.startsWith("-")) {
    throw new Error("pyth price is negative");
  }
  if (expo > 0 || expo < -12) {
    throw new Error("pyth expo is outside the supported scale");
  }
  const digits = price.replace(/^0+/, "") || "0";
  if (expo === 0) return digits;
  const frac = digits.padStart(-expo, "0");
  const whole = frac.slice(0, frac.length + expo);
  const decimals = frac.slice(frac.length + expo);
  return `${whole || "0"}.${decimals}`;
}

export async function fetchPyth(
  feedId: string,
  fetchImpl: typeof fetch,
): Promise<FreshObservation> {
  const payload = await fetchJson(
    `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${feedId}`,
    fetchImpl,
  );
  return parsePythLatest(payload);
}
