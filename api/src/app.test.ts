import { describe, expect, it } from "vitest";

import { buildApp } from "./app.js";
import { MemoryReadModel, unavailableReadModel } from "./read-model/memory.js";

describe("api", () => {
  it("reports that it is not the chain authority", async () => {
    const app = buildApp({ readModel: unavailableReadModel });
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ authority: "none", status: "ok" });
    await app.close();
  });

  it("does not invent request records when a store is empty", async () => {
    const app = buildApp({ readModel: new MemoryReadModel() });
    const response = await app.inject({ method: "GET", url: "/v1/requests" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ authority: "none", source: "read-model", items: [] });
    await app.close();
  });

  it("returns 503 when no read model is configured", async () => {
    const app = buildApp({ readModel: unavailableReadModel });
    const response = await app.inject({ method: "GET", url: "/v1/nodes" });
    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({ error: "READ_MODEL_UNAVAILABLE" });
    await app.close();
  });

  it("serves stored requests, nodes, and network counts", async () => {
    const app = buildApp({
      readModel: new MemoryReadModel(
        [
          {
            id: "req1",
            jobType: "Vrf",
            status: "Pending",
            requester: "r",
            callback: null,
            maxFee: "0",
            createdSlot: "1",
            expiresSlot: "2",
            assignedNode: null,
            assignedStake: null,
            assignedHeartbeat: null,
            updatedSlot: "3",
            result: null,
          },
        ],
        [
          {
            id: "node1",
            authority: "a",
            operator: "o",
            vrfPubkey: "k",
            stakeLamports: "10",
            jobMask: 1,
            status: "Active",
            reputation: "0",
            createdSlot: "1",
            lastHeartbeat: "4",
            cooldownEndSlot: null,
            updatedSlot: "4",
          },
        ],
      ),
    });
    const requests = await app.inject({ method: "GET", url: "/v1/requests" });
    expect(requests.json().items).toHaveLength(1);
    const nodes = await app.inject({ method: "GET", url: "/v1/nodes" });
    expect(nodes.json().items[0].status).toBe("Active");
    const network = await app.inject({ method: "GET", url: "/v1/network" });
    expect(network.json()).toMatchObject({
      authority: "none",
      requests: { total: 1 },
      nodes: { total: 1 },
    });
    const missing = await app.inject({ method: "GET", url: "/v1/jobs" });
    expect(missing.statusCode).toBe(501);
    await app.close();
  });
});
