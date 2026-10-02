import type { FastifyInstance } from "fastify";

import { notImplemented } from "../../common/errors.js";

export function registerPriceRoutes(app: FastifyInstance): void {
  app.get("/v1/prices", async (_request, reply) => {
    return reply.code(501).send(notImplemented);
  });
}
