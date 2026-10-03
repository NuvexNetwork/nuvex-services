import type { FastifyInstance } from "fastify";

import { readModelUnavailable } from "../../common/errors.js";
import type { ReadModel } from "../../read-model/types.js";

export function registerRequestRoutes(app: FastifyInstance, store: ReadModel): void {
  app.get("/v1/requests", async (_request, reply) => {
    if (!store.available) {
      return reply.code(503).send(readModelUnavailable);
    }
    const items = await store.listRequests();
    return {
      authority: "none",
      source: "read-model",
      items,
    };
  });
  app.get("/v1/requests/:id", async (request, reply) => {
    if (!store.available) {
      return reply.code(503).send(readModelUnavailable);
    }
    const { id } = request.params as { id: string };
    const item = await store.getRequest(id);
    if (!item) {
      return reply.code(404).send({
        error: "NOT_FOUND",
        message: "No indexed request with that id. The account may still exist on chain.",
      });
    }
    return { authority: "none", source: "read-model", item };
  });
}
