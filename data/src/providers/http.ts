export class ProviderHttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = "ProviderHttpError";
    this.status = status;
  }
}

export async function fetchJson(url: string, fetchImpl: typeof fetch): Promise<unknown> {
  const response = await fetchImpl(url, {
    headers: { accept: "application/json", "user-agent": "nuvex-services" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    throw new ProviderHttpError(response.status);
  }
  return response.json() as Promise<unknown>;
}

export function parseProviderTime(value: string): number {
  const trimmed = value.trim().replace(/(\.\d{3})\d+(Z)$/, "$1$2");
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) {
    throw new Error("provider timestamp is not parseable");
  }
  return ms;
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("provider payload is not an object");
  }
  return value as Record<string, unknown>;
}
