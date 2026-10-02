import type { FastifyInstance } from "fastify";

import { notImplemented } from "../../common/errors.js";

export function registerRequestRoutes(app: FastifyInstance): void {
  app.get("/v1/requests", async (_request, reply) => {
    return reply.code(501).send(notImplemented);
  });
  app.get("/v1/requests/:id", async (_request, reply) => {
    return reply.code(501).send(notImplemented);
  });
}
