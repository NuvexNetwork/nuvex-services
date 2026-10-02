import type { FastifyInstance } from "fastify";

import { notImplemented } from "../../common/errors.js";

export function registerJobRoutes(app: FastifyInstance): void {
  app.get("/v1/jobs", async (_request, reply) => {
    return reply.code(501).send(notImplemented);
  });
}
