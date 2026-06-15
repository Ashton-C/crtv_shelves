import { describe, expect, it } from "vitest";
import { jaccardSimilarity } from "../compatibility";

describe("jaccardSimilarity", () => {
  it("returns 0 when both sets are empty", () => {
    expect(jaccardSimilarity(new Set(), new Set())).toBe(0);
  });

  it("returns 0 when one set is empty", () => {
    expect(jaccardSimilarity(new Set(["a", "b"]), new Set())).toBe(0);
    expect(jaccardSimilarity(new Set(), new Set(["a", "b"]))).toBe(0);
  });

  it("returns 100 for identical sets", () => {
    const items = new Set(["kendrick lamar", "frank ocean", "tyler, the creator"]);
    expect(jaccardSimilarity(items, new Set([...items]))).toBe(100);
  });

  it("returns 0 for completely disjoint sets", () => {
    expect(
      jaccardSimilarity(new Set(["the godfather", "goodfellas"]), new Set(["breaking bad", "the wire"])),
    ).toBe(0);
  });

  it("computes 50% for half-overlapping sets", () => {
    // {a, b, c} ∩ {b, c, d} = {b, c} (2), ∪ = {a,b,c,d} (4) → 2/4 = 50%
    expect(
      jaccardSimilarity(new Set(["a", "b", "c"]), new Set(["b", "c", "d"])),
    ).toBe(50);
  });

  it("computes 33% for one-in-three overlap", () => {
    // {a, b, c} ∩ {c} = {c} (1), ∪ = {a,b,c} (3) → 1/3 ≈ 33%
    expect(
      jaccardSimilarity(new Set(["a", "b", "c"]), new Set(["c"])),
    ).toBe(33);
  });

  it("rounds rather than truncates", () => {
    // {a, b, c} ∩ {b, c} = {b, c} (2), ∪ = {a,b,c} (3) → 2/3 ≈ 67%
    expect(
      jaccardSimilarity(new Set(["a", "b", "c"]), new Set(["b", "c"])),
    ).toBe(67);
  });

  it("is commutative", () => {
    const a = new Set(["x", "y", "z"]);
    const b = new Set(["y", "z", "w"]);
    expect(jaccardSimilarity(a, b)).toBe(jaccardSimilarity(b, a));
  });

  it("is case-sensitive (callers are responsible for normalising)", () => {
    // The normalisation (toLowerCase) happens in friends.ts before calling this
    expect(
      jaccardSimilarity(new Set(["kendrick lamar"]), new Set(["Kendrick Lamar"])),
    ).toBe(0);
    expect(
      jaccardSimilarity(new Set(["kendrick lamar"]), new Set(["kendrick lamar"])),
    ).toBe(100);
  });
});
