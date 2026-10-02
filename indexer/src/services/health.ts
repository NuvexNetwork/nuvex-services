export function health() {
  return { status: "ok" as const, indexing: "disabled" as const };
}
