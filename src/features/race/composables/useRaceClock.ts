import { onScopeDispose, watch } from 'vue'

import { createAnimationFrameTicker, type Ticker } from '@/shared/lib/ticker'

import { useRaceStore } from '../store/race.store'

/**
 * Drives the race store from a ticker while the race is running.
 * Call it once, from the component that owns the race screen. The ticker is
 * injectable so tests can advance time frame by frame.
 */
export function useRaceClock(ticker: Ticker = createAnimationFrameTicker()): void {
  const race = useRaceStore()
  let stop: (() => void) | null = null

  watch(
    () => race.status === 'running',
    (running) => {
      if (running && !stop) {
        stop = ticker.start((deltaSeconds) => {
          race.tick(deltaSeconds)
        })
      } else if (!running && stop) {
        stop()
        stop = null
      }
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    stop?.()
    stop = null
  })
}
