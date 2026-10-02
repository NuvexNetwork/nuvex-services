import { describe, expect, it } from "vitest";

import { buildApp } from "./app.js";

describe("api", () => {
  it("reports that it is not the chain authority", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ authority: "none", status: "ok" });
    await app.close();
  });

  it("does not invent request records", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/v1/requests" });
    expect(response.statusCode).toBe(501);
    expect(response.json()).toMatchObject({ error: "NOT_IMPLEMENTED" });
    await app.close();
  });
});
