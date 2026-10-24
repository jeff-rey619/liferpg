export function wouldCreateCycle(
  nodeId: string,
  newParentId: string | null,
  parentMap: Map<string, string | null>,
): boolean {
  if (newParentId === null) return false;
  if (newParentId === nodeId) return true;
  let current: string | null = newParentId;
  const seen = new Set<string>();
  while (current) {
    if (current === nodeId) return true;
    if (seen.has(current)) return true; // existing cycle guard
    seen.add(current);
    current = parentMap.get(current) ?? null;
  }
  return false;
}