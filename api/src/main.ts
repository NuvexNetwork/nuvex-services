import { buildApp } from "./app.js";

const port = Number(process.env.NUVEX_API_PORT ?? "8080");
const host = process.env.NUVEX_API_HOST ?? "127.0.0.1";

const app = buildApp();

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
