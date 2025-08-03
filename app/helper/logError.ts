export function logError(error: unknown) {
  const err = error instanceof Error ? error.message : String(error);
  const stack = new Error().stack || "";
  const caller = stack.split("\n")[2]?.trim() || "unknown";
  console.error(`LOG ERROR in ${caller}:\n${err}`);
}
