import type { PriceQuote } from "../types.js";

export class UnknownSymbolError extends Error {
  constructor(symbol: string) {
    super(`unsupported symbol ${symbol}`);
    this.name = "UnknownSymbolError";
  }
}

export type CanonicalSymbol = {
  symbol: string;
  quote: PriceQuote;
  binance?: string;
  bybit?: string;
  coinbase?: string;
  kraken?: string;
  pyth?: string;
};

const SOL_USD_PYTH = "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
const BTC_USD_PYTH = "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
const ETH_USD_PYTH = "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";

const SYMBOLS: Record<string, CanonicalSymbol> = {
  "SOL/USD": {
    symbol: "SOL/USD",
    quote: "USD",
    coinbase: "SOL-USD",
    kraken: "SOLUSD",
    pyth: SOL_USD_PYTH,
  },
  "BTC/USD": {
    symbol: "BTC/USD",
    quote: "USD",
    coinbase: "BTC-USD",
    kraken: "XBTUSD",
    pyth: BTC_USD_PYTH,
  },
  "ETH/USD": {
    symbol: "ETH/USD",
    quote: "USD",
    coinbase: "ETH-USD",
    kraken: "ETHUSD",
    pyth: ETH_USD_PYTH,
  },
  "SOL/USDT": { symbol: "SOL/USDT", quote: "USDT", binance: "SOLUSDT", bybit: "SOLUSDT" },
  "BTC/USDT": { symbol: "BTC/USDT", quote: "USDT", binance: "BTCUSDT", bybit: "BTCUSDT" },
  "ETH/USDT": { symbol: "ETH/USDT", quote: "USDT", binance: "ETHUSDT", bybit: "ETHUSDT" },
};

const ALIASES: Record<string, string> = {
  SOL: "SOL/USD",
  "SOL/USD": "SOL/USD",
  "SOL-USD": "SOL/USD",
  SOLUSD: "SOL/USD",
  "SOL/USDT": "SOL/USDT",
  "SOL-USDT": "SOL/USDT",
  SOLUSDT: "SOL/USDT",
  BTC: "BTC/USD",
  "BTC/USD": "BTC/USD",
  "BTC-USD": "BTC/USD",
  BTCUSD: "BTC/USD",
  XBTUSD: "BTC/USD",
  "BTC/USDT": "BTC/USDT",
  "BTC-USDT": "BTC/USDT",
  BTCUSDT: "BTC/USDT",
  ETH: "ETH/USD",
  "ETH/USD": "ETH/USD",
  "ETH-USD": "ETH/USD",
  ETHUSD: "ETH/USD",
  "ETH/USDT": "ETH/USDT",
  "ETH-USDT": "ETH/USDT",
  ETHUSDT: "ETH/USDT",
};

export function normalizeSymbol(input: string): CanonicalSymbol {
  const key = input.trim().toUpperCase();
  const canonical = ALIASES[key];
  const symbol = canonical ? SYMBOLS[canonical] : undefined;
  if (!symbol) {
    throw new UnknownSymbolError(input);
  }
  return symbol;
}
