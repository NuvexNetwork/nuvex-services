import { ProviderNotImplementedError } from "./errors.js";

export function fetchTicker(): Promise<never> {
  return Promise.reject(new ProviderNotImplementedError("kraken"));
}
