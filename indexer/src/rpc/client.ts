export type RpcAccount = {
  pubkey: string;
  data: Buffer;
};

type JsonRpcResponse<T> = {
  result?: T;
  error?: { message?: string };
};

type ProgramAccount = {
  pubkey: string;
  account: { data: [string, string] | string };
};

async function rpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!response.ok) {
    throw new Error(`RPC ${method} failed with HTTP ${response.status}`);
  }
  const body = (await response.json()) as JsonRpcResponse<T>;
  if (body.error) {
    throw new Error(body.error.message ?? `RPC ${method} failed`);
  }
  if (body.result === undefined) {
    throw new Error(`RPC ${method} returned no result`);
  }
  return body.result;
}

export async function getSlot(rpcUrl: string): Promise<bigint> {
  const slot = await rpc<number>(rpcUrl, "getSlot", [{ commitment: "confirmed" }]);
  return BigInt(slot);
}

export async function getProgramAccounts(rpcUrl: string, programId: string): Promise<RpcAccount[]> {
  const accounts = await rpc<ProgramAccount[]>(rpcUrl, "getProgramAccounts", [
    programId,
    { encoding: "base64", commitment: "confirmed" },
  ]);
  return accounts.map((item) => {
    const encoded = Array.isArray(item.account.data) ? item.account.data[0] : item.account.data;
    return { pubkey: item.pubkey, data: Buffer.from(encoded ?? "", "base64") };
  });
}
