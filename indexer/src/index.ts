import { configFromEnv } from "./config.js";
import { checkpointStatus } from "./checkpoints/checkpoint.js";
import { pollOnce } from "./poll.js";
import { closePool } from "./store/postgres.js";
import { MemoryStore } from "./store/memory.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function run(argv: readonly string[]): Promise<number> {
  if (argv.includes("--health")) {
    process.stdout.write(
      `${JSON.stringify({
        status: "ok",
        indexing: "process",
        checkpoint: checkpointStatus(),
      })}\n`,
    );
    return 0;
  }

  const command = argv[0] === "start" || argv.length === 0 ? "start" : argv[0];
  if (command !== "start") {
    process.stderr.write(`nuvex indexer: unknown command ${command}\n`);
    return 2;
  }

  const { config, missing } = configFromEnv();
  if (!config) {
    process.stderr.write(
      `nuvex indexer: missing ${missing.join(", ")}. Refusing to invent chain rows.\n`,
    );
    return 2;
  }

  const store = new MemoryStore();
  const poll = async () => {
    try {
      await pollOnce(store, config);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`nuvex indexer: poll failed: ${message}\n`);
    }
  };

  if (config.once) {
    await poll();
    await closePool();
    return 0;
  }

  let stopped = false;
  const stop = () => {
    stopped = true;
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  while (!stopped) {
    await poll();
    if (stopped) break;
    await sleep(config.pollMs);
  }

  await closePool();
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const code = await run(process.argv.slice(2));
  process.exit(code);
}
