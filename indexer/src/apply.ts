import { decodeAccount } from "./decoders/programs.js";
import type { MemoryStore } from "./store/memory.js";

export type AccountSnapshot = {
  pubkey: string;
  data: Buffer;
};

export type ApplyStats = {
  decoded: number;
  ignored: number;
};

/** Replace the in-memory view with the accounts observed in this poll. */
export function applyAccounts(
  store: MemoryStore,
  accounts: readonly AccountSnapshot[],
  slot: bigint,
): ApplyStats {
  store.requests.clear();
  store.nodes.clear();
  store.results.clear();
  store.registry = null;
  store.protocol = null;

  let decoded = 0;
  let ignored = 0;
  for (const account of accounts) {
    const item = decodeAccount(account.pubkey, account.data);
    if (!item) {
      ignored += 1;
      continue;
    }
    decoded += 1;
    switch (item.kind) {
      case "request":
        store.upsertRequest({
          id: item.account.pubkey,
          jobType: item.account.jobType,
          status: item.account.status,
          requester: item.account.requester,
          callback: item.account.callbackProgram,
          maxFee: item.account.maxFee,
          createdSlot: item.account.createdSlot,
          expiresSlot: item.account.expiresSlot,
          assignedNode: item.account.assignedNode,
          assignedStake: item.account.assignedStake,
          assignedHeartbeat: item.account.assignedHeartbeat,
          updatedSlot: slot,
        });
        break;
      case "node":
        store.upsertNode({
          id: item.account.pubkey,
          authority: item.account.authority,
          operator: item.account.operator,
          vrfPubkey: item.account.vrfPubkey,
          stakeLamports: item.account.stakeLamports,
          jobMask: item.account.jobMask,
          status: item.account.status,
          reputation: item.account.reputation,
          createdSlot: item.account.createdSlot,
          lastHeartbeat: item.account.lastHeartbeat,
          cooldownEndSlot: item.account.cooldownEndSlot,
          updatedSlot: slot,
        });
        break;
      case "registry":
        store.setRegistry({
          id: item.account.pubkey,
          authority: item.account.authority,
          nodeCount: item.account.nodeCount,
          minStake: item.account.minStake,
          unstakeCooldownSlots: item.account.unstakeCooldownSlots,
          heartbeatTimeoutSlots: item.account.heartbeatTimeoutSlots,
          slashAuthority: item.account.slashAuthority,
          slashDestination: item.account.slashDestination,
          updatedSlot: slot,
        });
        break;
      case "protocol":
        store.setProtocol({
          id: item.account.pubkey,
          authority: item.account.authority,
          paused: item.account.paused,
          updatedSlot: slot,
        });
        break;
      case "vrf_result":
        store.upsertResult({
          id: item.account.pubkey,
          requestId: item.account.request,
          node: item.account.node,
          outputHex: item.account.outputHex,
          slot,
        });
        break;
    }
  }
  store.setCheckpoint(slot);
  return { decoded, ignored };
}
