import { ProviderNotImplementedError } from "./errors.js";

export function fetchPrice(): Promise<never> {
  return Promise.reject(new ProviderNotImplementedError("pyth"));
}
