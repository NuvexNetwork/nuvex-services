import {
  aggregatePrices,
  InvalidPriceQuery,
  UnknownSymbolError,
  type PriceAggregate,
} from "@nuvex/oracle-data";
import type { FastifyInstance } from "fastify";

type PriceReader = typeof aggregatePrices;

export function registerPriceRoutes(
  app: FastifyInstance,
  read: PriceReader = aggregatePrices,
): void {
  app.get("/v1/prices", async (request, reply) => {
    const query = request.query as { symbol?: string; maxAgeMs?: string; minimumSources?: string };
    if (!query.symbol) {
      return reply.code(400).send({
        error: "BAD_REQUEST",
        message: "symbol is required. Supported names include SOL/USD and SOL/USDT.",
      });
    }
    const maxAgeMs = query.maxAgeMs === undefined ? undefined : Number(query.maxAgeMs);
    const minimumSources =
      query.minimumSources === undefined ? undefined : Number(query.minimumSources);
    try {
      const result = await read({ symbol: query.symbol, maxAgeMs, minimumSources });
      if (!result.sufficient) {
        return reply.code(422).send(result);
      }
      return result;
    } catch (error) {
      if (error instanceof UnknownSymbolError || error instanceof InvalidPriceQuery) {
        return reply.code(400).send({ error: "BAD_REQUEST", message: error.message });
      }
      throw error;
    }
  });
}

export type { PriceAggregate };
