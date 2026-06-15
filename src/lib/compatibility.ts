/**
 * Computes Jaccard similarity between two sets of item names.
 * Returns a percentage (0–100), rounded to the nearest integer.
 */
export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = [...setA].filter((item) => setB.has(item)).length;
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 0;
  return Math.round((intersection / union) * 100);
}
