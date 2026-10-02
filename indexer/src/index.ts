import { checkpointStatus } from "./checkpoints/checkpoint.js";

export function run(argv: readonly string[]): number {
  if (argv.includes("--health")) {
    process.stdout.write(
      `${JSON.stringify({ status: "ok", indexing: "disabled", checkpoint: checkpointStatus() })}\n`,
    );
    return 0;
  }
  process.stderr.write("nuvex indexer: chain indexing is not implemented (milestone 4)\n");
  return 2;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(run(process.argv.slice(2)));
}
