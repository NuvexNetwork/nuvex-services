const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Encode 32-byte Solana public keys. No decode is required for the read model. */
export function encodeBase58(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;

  const digits = [0];
  for (let index = zeros; index < bytes.length; index += 1) {
    let carry = bytes[index]!;
    for (let i = 0; i < digits.length; i += 1) {
      carry += digits[i]! * 256;
      digits[i] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }

  let start = digits.length - 1;
  while (start >= 0 && digits[start] === 0) start -= 1;

  let out = "1".repeat(zeros);
  for (let i = start; i >= 0; i -= 1) {
    out += ALPHABET[digits[i]!];
  }
  return out;
}
