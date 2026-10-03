export type PriceQuote = "USD" | "USDT";

export type FreshObservation = {
  provider: string;
  price: string;
  observedAt: string;
  timeField: string;
};

export type RejectedObservation = {
  provider: string;
  reason: string;
};

export type PriceAggregate = {
  authority: "none";
  source: "providers";
  symbol: string;
  quote: PriceQuote;
  median: string | null;
  sufficient: boolean;
  minimumSources: number;
  maxAgeMs: number;
  fresh: FreshObservation[];
  rejected: RejectedObservation[];
  note: string;
};

export const PRICE_NOTE =
  "Not a protocol result. Programs still reject Price requests. USDT venues are not mixed into a USD median.";
