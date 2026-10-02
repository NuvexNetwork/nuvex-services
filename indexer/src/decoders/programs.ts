export const PROGRAM_NAMES = ["oracle_core", "oracle_registry", "verification"] as const;

export function decoderAvailable(program: (typeof PROGRAM_NAMES)[number]): boolean {
  void program;
  return false;
}
