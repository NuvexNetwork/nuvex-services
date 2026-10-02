/**
 * The API is not a protocol authority.
 * Callers must not treat an HTTP response as a finalized oracle result.
 */
export function chainAuthority(): "none" {
  return "none";
}
