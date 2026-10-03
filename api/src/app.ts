import Fastify, { type FastifyInstance } from "fastify";

import { chainAuthority } from "./auth/authority.js";
import { databaseStatus } from "./database/status.js";
import { registerJobRoutes } from "./modules/jobs/routes.js";
import { registerModelRoutes } from "./modules/models/routes.js";
import { registerNetworkRoutes } from "./modules/network/routes.js";
import { registerNodeRoutes } from "./modules/nodes/routes.js";
import { registerPriceRoutes } from "./modules/prices/routes.js";
import { registerRequestRoutes } from "./modules/requests/routes.js";
import { aggregatePrices } from "@nuvex/oracle-data";

import { readModelFromEnv } from "./read-model/from-env.js";
import type { ReadModel } from "./read-model/types.js";
import { websocketStatus } from "./websocket/hub.js";

export function buildApp(options?: {
  readModel?: ReadModel;
  prices?: typeof aggregatePrices;
}): FastifyInstance {
  const store = options?.readModel ?? readModelFromEnv();
  const app = Fastify({
    logger:
      process.env.VITEST === "true"
        ? false
        : {
            level: process.env.LOG_LEVEL ?? "info",
            redact: ["req.headers.authorization", "req.headers.x-api-key"],
          },
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "nuvex-api",
    authority: chainAuthority(),
  }));

  app.get("/live", async () => ({ status: "ok" }));

  app.get("/ready", async () => ({
    status: "ready",
    scope: "process",
    database: databaseStatus(),
    websocket: websocketStatus(),
    readModel: store.available ? "configured" : "unavailable",
  }));

  registerRequestRoutes(app, store);
  registerNodeRoutes(app, store);
  registerJobRoutes(app);
  registerModelRoutes(app);
  registerPriceRoutes(app, options?.prices);
  registerNetworkRoutes(app, store);

  return app;
}
