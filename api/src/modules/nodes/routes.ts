import type { FastifyInstance } from "fastify";

import { readModelUnavailable } from "../../common/errors.js";
import type { ReadModel } from "../../read-model/types.js";

export function registerNodeRoutes(app: FastifyInstance, store: ReadModel): void {
  app.get("/v1/nodes", async (_request, reply) => {
    if (!store.available) {
      return reply.code(503).send(readModelUnavailable);
    }
    const items = await store.listNodes();
    return {
      authority: "none",
      source: "read-model",
      items,
    };
  });
}
