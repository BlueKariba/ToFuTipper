export function normalizeName(input: string) {
  return input.trim().replace(/\s+/g, " ").toLowerCase();
}
