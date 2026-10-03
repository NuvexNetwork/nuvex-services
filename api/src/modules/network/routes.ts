import type { FastifyInstance } from "fastify";

import { readModelUnavailable } from "../../common/errors.js";
import type { ReadModel } from "../../read-model/types.js";

export function registerNetworkRoutes(app: FastifyInstance, store: ReadModel): void {
  app.get("/v1/network", async (_request, reply) => {
    if (!store.available) {
      return reply.code(503).send(readModelUnavailable);
    }
    return store.network();
  });
}
