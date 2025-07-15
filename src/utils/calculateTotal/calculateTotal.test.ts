import { describe, it, expect } from "vitest";
import calculateTotal from "./calculateTotal";

describe("calculateTotal", () => {
  it("returns 0 for empty inputs", () => {
    expect(calculateTotal("")).toBe(0);
    expect(calculateTotal(',\n, ')).toBe(0);
  });

  it("sums comma-separated values", () => {
    expect(calculateTotal("100,200,300")).toBe(600);
  });

  it("sums newline-separated values", () => {
    expect(calculateTotal("100\n200\n300")).toBe(600);
  });

  it("sums mixed comma and newline-separated values", () => {
    expect(calculateTotal("100,200\n300")).toBe(600);
  });

  it("ignores extra whitespace and empty lines", () => {
    expect(calculateTotal(" 100 , \n200\n\n, 300 ")).toBe(600);
  });

  it("handles floats and integers", () => {
    expect(calculateTotal("1.5,2.5\n3")).toBe(7);
    expect(calculateTotal("1.1,2.2\n3.3")).toBeCloseTo(6.6);
    expect(calculateTotal("99.99,0.01")).toBe(100);
  });

  it("ignores invalid numbers", () => {
    expect(calculateTotal("100,abc,200")).toBe(300);
    expect(calculateTotal("100three\n200")).toBe(300);
  });
});