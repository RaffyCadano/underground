/** Bracket size rounded up to the next power of two (minimum 2). */
export function nextPowerOf2(n: number): number {
  if (n < 2) return 2;
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Standard elimination seed positions for a power-of-two bracket.
 * Pair 1 vs N, 2 vs N-1, etc. so byes spread across the tree.
 */
export function generateSeedPairs(size: number): [number, number][] {
  let positions = [1, 2];
  while (positions.length < size) {
    const sum = positions.length * 2 + 1;
    const next: number[] = [];
    for (const pos of positions) {
      next.push(pos);
      next.push(sum - pos);
    }
    positions = next;
  }
  const pairs: [number, number][] = [];
  for (let i = 0; i < positions.length; i += 2) {
    pairs.push([positions[i], positions[i + 1]]);
  }
  return pairs;
}
