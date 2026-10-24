import { describe, it, expect } from "vitest";
import { wouldCreateCycle } from "./hierarchy";

describe("wouldCreateCycle", () => {
  it("returns false when parent is null", () => {
    const m = new Map([["a", null]]);
    expect(wouldCreateCycle("a", null, m)).toBe(false);
  });

  it("detects direct self-cycle", () => {
    const m = new Map([["a", null]]);
    expect(wouldCreateCycle("a", "a", m)).toBe(true);
  });

  it("detects indirect cycle", () => {
    const m = new Map([
      ["a", "b"],
      ["b", "c"],
      ["c", null],
    ]);
    // making c's parent a would create a->b->c->a
    expect(wouldCreateCycle("c", "a", m)).toBe(true);
  });

  it("allows valid reparent", () => {
    const m = new Map([
      ["a", null],
      ["b", "a"],
    ]);
    expect(wouldCreateCycle("b", null, m)).toBe(false);
  });
});