const SCALE = 12;

export function parseDecimal(value: string): bigint {
  if (!/^\d+(\.\d+)?$/.test(value)) {
    throw new Error("invalid price");
  }
  const [whole, frac = ""] = value.split(".");
  if (frac.length > SCALE) {
    throw new Error("price has more than 12 decimal places");
  }
  return BigInt((whole ?? "0") + frac.padEnd(SCALE, "0"));
}

export function formatDecimal(value: bigint): string {
  const text = value.toString().padStart(SCALE + 1, "0");
  const whole = text.slice(0, -SCALE);
  const frac = text.slice(-SCALE).replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole;
}
