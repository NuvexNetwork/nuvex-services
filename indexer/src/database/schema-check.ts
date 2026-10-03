import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REQUIRED_TABLES = [
  "nodes",
  "node_events",
  "requests",
  "request_events",
  "jobs",
  "results",
  "verifications",
  "challenges",
  "rewards",
  "transactions",
  "models",
  "model_versions",
  "price_observations",
  "network_metrics",
  "checkpoints",
  "registry",
  "protocol",
] as const;

export function readSchema(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return readFileSync(resolve(here, "../../prisma/schema.prisma"), "utf8");
}

export function missingTables(schema: string): string[] {
  return REQUIRED_TABLES.filter((table) => !schema.includes(`@@map("${table}")`));
}
