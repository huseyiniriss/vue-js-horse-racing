/** Calls back on every frame with the seconds elapsed since the previous one. */
export interface Ticker {
  /** Starts ticking and returns a function that stops it. */
  start(onTick: (deltaSeconds: number) => void): () => void
}

/**
 * requestAnimationFrame-based ticker.
 *
 * Browsers stop animation frames in background tabs. When the tab comes back the
 * first delta would be huge, so it is capped: the race simply resumes where it was
 * instead of jumping to the end.
 */
export function createAnimationFrameTicker(maxDeltaSeconds = 0.1): Ticker {
  return {
    start(onTick) {
      let frameId = 0
      let last: number | null = null
      let stopped = false

      const frame = (now: number) => {
        if (last !== null) {
          onTick(Math.min((now - last) / 1000, maxDeltaSeconds))
        }
        last = now
        // onTick may have stopped the ticker; do not schedule another frame then.
        if (!stopped) frameId = requestAnimationFrame(frame)
      }

      frameId = requestAnimationFrame(frame)
      return () => {
        stopped = true
        cancelAnimationFrame(frameId)
      }
    },
  }
}
