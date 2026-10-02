export class ProviderNotImplementedError extends Error {
  readonly provider: string;

  constructor(provider: string) {
    super(`${provider} market data is not implemented (milestone 5)`);
    this.name = "ProviderNotImplementedError";
    this.provider = provider;
  }
}
