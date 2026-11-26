import { describe, expect, it } from "vitest";
import {
  clampSlideIndex,
  detectSwipeDirection,
  pickNextQuoteIndex,
} from "../slideNavigation";

describe("clampSlideIndex", () => {
  it("returns 0 when totalSlides is zero or negative", () => {
    expect(clampSlideIndex(2, 0)).toBe(0);
    expect(clampSlideIndex(0, -3)).toBe(0);
    expect(clampSlideIndex(1, Number.NaN)).toBe(0);
  });

  it("keeps valid indices within bounds and clamps negative or overflow values", () => {
    expect(clampSlideIndex(0, 5)).toBe(0);
    expect(clampSlideIndex(2, 5)).toBe(2);
    expect(clampSlideIndex(4, 5)).toBe(4);
    expect(clampSlideIndex(-1, 5)).toBe(0);
    expect(clampSlideIndex(-99, 5)).toBe(0);
    expect(clampSlideIndex(5, 5)).toBe(4);
    expect(clampSlideIndex(42, 5)).toBe(4);
  });

  it("truncates fractional indices and handles non-finite inputs safely", () => {
    expect(clampSlideIndex(1.9, 5)).toBe(1);
    expect(clampSlideIndex(3.1, 5)).toBe(3);
    expect(clampSlideIndex(-0.5, 5)).toBe(0);
    expect(Object.is(clampSlideIndex(-0.5, 5), -0)).toBe(false);
    expect(clampSlideIndex(Number.NaN, 5)).toBe(0);
    expect(clampSlideIndex(Number.POSITIVE_INFINITY, 5)).toBe(0);
    expect(clampSlideIndex(Number.NEGATIVE_INFINITY, 5)).toBe(0);
  });
});

describe("detectSwipeDirection", () => {
  it("detects left swipe as 1 (next slide) and right swipe as -1 (previous slide)", () => {
    expect(detectSwipeDirection(-55, 0)).toBe(1);
    expect(detectSwipeDirection(-120, 20)).toBe(1);
    expect(detectSwipeDirection(55, 0)).toBe(-1);
    expect(detectSwipeDirection(120, -20)).toBe(-1);
  });

  it("returns 0 for taps and short horizontal drags below minDistance", () => {
    expect(detectSwipeDirection(0, 0)).toBe(0);
    expect(detectSwipeDirection(-54, 0)).toBe(0);
    expect(detectSwipeDirection(54, 0)).toBe(0);
    expect(detectSwipeDirection(-29, 0, 30)).toBe(0);
    expect(detectSwipeDirection(-30, 0, 30)).toBe(1);
  });

  it("returns 0 for vertical and steep diagonal drags where |dx| <= |dy| * 1.25", () => {
    expect(detectSwipeDirection(0, 120)).toBe(0);
    expect(detectSwipeDirection(-60, 120)).toBe(0);
    expect(detectSwipeDirection(60, -120)).toBe(0);
    // Exact boundary: |dx| === |dy| * 1.25 (100 === 80 * 1.25)
    expect(detectSwipeDirection(-100, 80)).toBe(0);
    expect(detectSwipeDirection(100, -80)).toBe(0);
    // Strictly greater than |dy| * 1.25
    expect(detectSwipeDirection(-101, 80)).toBe(1);
    expect(detectSwipeDirection(101, -80)).toBe(-1);
  });

  it("handles non-finite inputs safely by returning 0", () => {
    expect(detectSwipeDirection(Number.NaN, 0)).toBe(0);
    expect(detectSwipeDirection(-100, Number.NaN)).toBe(0);
    expect(detectSwipeDirection(Number.POSITIVE_INFINITY, 0)).toBe(0);
    expect(detectSwipeDirection(Number.NEGATIVE_INFINITY, 0)).toBe(0);
    expect(detectSwipeDirection(-100, 0, Number.NaN)).toBe(0);
  });
});

describe("pickNextQuoteIndex", () => {
  it("returns 0 when total is less than or equal to 1", () => {
    expect(pickNextQuoteIndex(1, null, () => 0.5)).toBe(0);
    expect(pickNextQuoteIndex(1, 0, () => 0.999)).toBe(0);
    expect(pickNextQuoteIndex(0, null, () => 0.5)).toBe(0);
    expect(pickNextQuoteIndex(-4, 0, () => 0.5)).toBe(0);
  });

  it("picks across [0, total - 1] when currentIndex is null or out of range", () => {
    expect(pickNextQuoteIndex(3, null, () => 0)).toBe(0);
    expect(pickNextQuoteIndex(3, null, () => 0.5)).toBe(1);
    expect(pickNextQuoteIndex(3, null, () => 0.999)).toBe(2);

    expect(pickNextQuoteIndex(3, -1, () => 0)).toBe(0);
    expect(pickNextQuoteIndex(3, 3, () => 0.999)).toBe(2);
    expect(pickNextQuoteIndex(3, 10, () => 0.5)).toBe(1);
  });

  it("never repeats currentIndex and uniformly covers all remaining indices", () => {
    const total = 4;
    const sampleRngValues = [0, 0.001, 0.33, 0.34, 0.5, 0.66, 0.67, 0.999];

    for (let current = 0; current < total; current++) {
      const picked = new Set<number>();
      for (const r of sampleRngValues) {
        const next = pickNextQuoteIndex(total, current, () => r);
        expect(next).toBeGreaterThanOrEqual(0);
        expect(next).toBeLessThan(total);
        expect(next).not.toBe(current);
        picked.add(next);
      }

      // All other indices should be reachable
      expect(picked.size).toBe(total - 1);
      expect(picked.has(current)).toBe(false);
    }
  });

  it("handles boundary and out-of-range rng values defensively without repeating", () => {
    expect(pickNextQuoteIndex(3, 0, () => 0)).toBe(1);
    expect(pickNextQuoteIndex(3, 0, () => 0.999)).toBe(2);
    expect(pickNextQuoteIndex(3, 0, () => 1)).toBe(2);
    expect(pickNextQuoteIndex(3, 0, () => 1.5)).toBe(2);
    expect(pickNextQuoteIndex(3, 0, () => -0.25)).toBe(1);
    expect(pickNextQuoteIndex(3, 0, () => Number.NaN)).toBe(1);

    expect(pickNextQuoteIndex(3, 2, () => 1)).toBe(1);
    expect(pickNextQuoteIndex(3, 2, () => -1)).toBe(0);
    expect(pickNextQuoteIndex(3, null, () => 1)).toBe(2);
    expect(pickNextQuoteIndex(3, null, () => -0.5)).toBe(0);
  });

  it("alternates cleanly when total is 2", () => {
    expect(pickNextQuoteIndex(2, 0, () => 0)).toBe(1);
    expect(pickNextQuoteIndex(2, 0, () => 0.999)).toBe(1);
    expect(pickNextQuoteIndex(2, 1, () => 0)).toBe(0);
    expect(pickNextQuoteIndex(2, 1, () => 0.999)).toBe(0);
  });
});
