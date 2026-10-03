import { describe, expect, it } from "vitest";

import { encodeBase58 } from "./base58.js";
import {
  encodeNodeAccount,
  encodeNodeRegistry,
  encodeOracleRequest,
  encodeProtocolConfig,
  encodeVrfResult,
  pubkeyBytes,
} from "./fixtures.js";
import {
  DEFAULT_PUBKEY,
  decodeAccount,
  decodeNode,
  decodeProtocol,
  decodeRegistry,
  decodeRequest,
  decodeVrfResult,
  decoderAvailable,
} from "./programs.js";

describe("decoders", () => {
  it("encodes the all-zero pubkey as the Solana default", () => {
    expect(encodeBase58(Buffer.alloc(32))).toBe(DEFAULT_PUBKEY);
  });

  it("exposes decoders for the three programs", () => {
    expect(decoderAvailable("oracle_core")).toBe(true);
    expect(decoderAvailable("oracle_registry")).toBe(true);
    expect(decoderAvailable("verification")).toBe(true);
  });

  it("decodes a pending VRF request and leaves assignment empty", () => {
    const data = encodeOracleRequest({
      status: 2,
      maxFee: 42n,
      createdSlot: 11n,
      expiresSlot: 99n,
    });
    const request = decodeRequest(encodeBase58(pubkeyBytes(11)), data);
    expect(request).toMatchObject({
      jobType: "Vrf",
      status: "Pending",
      maxFee: 42n,
      createdSlot: 11n,
      expiresSlot: 99n,
      assignedNode: null,
      callbackProgram: null,
    });
  });

  it("decodes an assigned node, registry, protocol, and VRF result", () => {
    const requestPk = pubkeyBytes(7);
    const nodePk = pubkeyBytes(8);
    const request = decodeRequest(
      "req",
      encodeOracleRequest({
        assignedNode: nodePk,
        assignedStake: 500n,
        assignedHeartbeat: 12n,
        status: 7,
      }),
    );
    expect(request?.assignedNode).toBe(encodeBase58(nodePk));
    expect(request?.assignedStake).toBe(500n);

    const node = decodeNode("node", encodeNodeAccount({ stake: 9n, status: 2, lastHeartbeat: 4n }));
    expect(node).toMatchObject({ status: "Active", stakeLamports: 9n, lastHeartbeat: 4n });

    const registry = decodeRegistry("reg", encodeNodeRegistry({ nodeCount: 3n, minStake: 10n }));
    expect(registry).toMatchObject({ nodeCount: 3n, minStake: 10n, slashAuthority: null });

    const protocol = decodeProtocol("cfg", encodeProtocolConfig({ paused: true }));
    expect(protocol?.paused).toBe(true);

    const result = decodeVrfResult("vrf", encodeVrfResult({ request: requestPk, node: nodePk }));
    expect(result?.request).toBe(encodeBase58(requestPk));
    expect(result?.outputHex).toBe(Buffer.alloc(64, 9).toString("hex"));
  });

  it("ignores unknown account layouts", () => {
    expect(decodeAccount("x", Buffer.from("not-an-account"))).toBeNull();
  });
});
