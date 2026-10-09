/** Accumulate travel from each direction change, ignoring small scroll jitter. */
export function headerScrollState(
  previous: { y: number; direction: number; travel: number; hidden: boolean },
  y: number,
  topBoundary: number,
  pinned: boolean,
) {
  y = Math.max(0, y)
  const delta = y - previous.y
  const direction = Math.sign(delta)
  const travel =
    direction && direction !== previous.direction
      ? Math.abs(delta)
      : previous.travel + Math.abs(delta)
  const hidden =
    pinned || y <= topBoundary
      ? false
      : travel >= 12 && direction
        ? direction > 0
        : previous.hidden
  return { y, direction: direction || previous.direction, travel, hidden }
}
