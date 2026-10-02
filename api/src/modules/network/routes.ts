import type { FastifyInstance } from "fastify";

import { notImplemented } from "../../common/errors.js";

export function registerNetworkRoutes(app: FastifyInstance): void {
  app.get("/v1/network", async (_request, reply) => {
    return reply.code(501).send(notImplemented);
  });
}
