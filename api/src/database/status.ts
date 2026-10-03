export interface DatabaseStatus {
  connected: boolean;
  reason: string;
}

export function databaseStatus(): DatabaseStatus {
  if (process.env.DATABASE_URL?.trim()) {
    return { connected: true, reason: "DATABASE_URL is set. The API is not chain authority." };
  }
  if (process.env.NUVEX_READ_MODEL_PATH?.trim()) {
    return {
      connected: false,
      reason: "Serving a snapshot file. DATABASE_URL is unset.",
    };
  }
  return {
    connected: false,
    reason: "DATABASE_URL is unset. Collection reads return 503 until a store is configured.",
  };
}
