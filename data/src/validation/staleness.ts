export const DEFAULT_MAX_AGE_MS = 60_000;
export const DEFAULT_MIN_SOURCES = 2;
export const MAX_FUTURE_MS = 30_000;
export const MIN_MAX_AGE_MS = 1_000;
export const MAX_MAX_AGE_MS = 300_000;

export class InvalidPriceQuery extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPriceQuery";
  }
}

export function readPriceQuery(input: { maxAgeMs?: number; minimumSources?: number }): {
  maxAgeMs: number;
  minimumSources: number;
} {
  const maxAgeMs = input.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
  const minimumSources = input.minimumSources ?? DEFAULT_MIN_SOURCES;
  if (!Number.isInteger(maxAgeMs) || maxAgeMs < MIN_MAX_AGE_MS || maxAgeMs > MAX_MAX_AGE_MS) {
    throw new InvalidPriceQuery(
      `maxAgeMs must be an integer from ${MIN_MAX_AGE_MS} to ${MAX_MAX_AGE_MS}`,
    );
  }
  if (!Number.isInteger(minimumSources) || minimumSources < 1 || minimumSources > 5) {
    throw new InvalidPriceQuery("minimumSources must be an integer from 1 to 5");
  }
  return { maxAgeMs, minimumSources };
}

export function classifyAge(
  observedAtMs: number,
  nowMs: number,
  maxAgeMs: number,
): "fresh" | "stale" | "ahead" | "invalid" {
  if (!Number.isFinite(observedAtMs)) return "invalid";
  if (observedAtMs > nowMs + MAX_FUTURE_MS) return "ahead";
  if (nowMs - observedAtMs > maxAgeMs) return "stale";
  return "fresh";
}
