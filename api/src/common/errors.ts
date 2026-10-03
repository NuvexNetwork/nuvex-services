export const notImplemented = {
  error: "NOT_IMPLEMENTED",
  message:
    "Jobs, models, and prices are not a Milestone 4 read. Chain state remains authoritative.",
} as const;

export const readModelUnavailable = {
  error: "READ_MODEL_UNAVAILABLE",
  message:
    "No read model is configured. Set DATABASE_URL or NUVEX_READ_MODEL_PATH. Chain accounts remain authoritative.",
} as const;
