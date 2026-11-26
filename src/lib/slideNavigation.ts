const SWIPE_HORIZONTAL_RATIO = 1.25;

export function clampSlideIndex(index: number, totalSlides: number): number {
  const count = Number.isFinite(totalSlides) ? Math.trunc(totalSlides) : 0;
  if (count <= 0) {
    return 0;
  }

  const truncated = Number.isFinite(index) ? Math.trunc(index) : 0;
  const clamped = Math.min(count - 1, Math.max(0, truncated));
  return clamped === 0 ? 0 : clamped;
}

export function detectSwipeDirection(
  dx: number,
  dy: number,
  minDistance = 55,
): -1 | 0 | 1 {
  if (
    !Number.isFinite(dx) ||
    !Number.isFinite(dy) ||
    !Number.isFinite(minDistance)
  ) {
    return 0;
  }

  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (absX < minDistance || absX <= absY * SWIPE_HORIZONTAL_RATIO) {
    return 0;
  }

  return dx < 0 ? 1 : -1;
}

function clampUnitRandom(value: number): number {
  if (Number.isNaN(value) || value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1 - Number.EPSILON;
  }
  return value;
}

export function pickNextQuoteIndex(
  total: number,
  currentIndex: number | null,
  rng: () => number = Math.random,
): number {
  const count = Number.isFinite(total) ? Math.trunc(total) : 0;
  if (count <= 1) {
    return 0;
  }

  const unit = clampUnitRandom(rng());

  if (
    currentIndex === null ||
    !Number.isInteger(currentIndex) ||
    currentIndex < 0 ||
    currentIndex >= count
  ) {
    return Math.min(count - 1, Math.floor(unit * count));
  }

  const offset = Math.min(count - 2, Math.floor(unit * (count - 1)));
  return offset >= currentIndex ? offset + 1 : offset;
}
