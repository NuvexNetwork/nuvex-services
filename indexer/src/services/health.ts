export function health() {
  return { status: "ok" as const, indexing: "process" as const };
}
