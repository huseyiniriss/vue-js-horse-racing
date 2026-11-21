import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick } from 'vue'

import { useHorsesStore } from '@/features/horses'
import { createRandom } from '@/shared/lib/random'
import type { Ticker } from '@/shared/lib/ticker'

import { useRaceStore } from '../store/race.store'
import { useRaceClock } from './useRaceClock'

/** A ticker the test advances by hand. */
function createManualTicker() {
  let listener: ((delta: number) => void) | null = null
  const ticker: Ticker = {
    start(onTick) {
      listener = onTick
      return () => {
        listener = null
      }
    },
  }
  return {
    ticker,
    get running() {
      return listener !== null
    },
    advance(seconds: number) {
      listener?.(seconds)
    },
  }
}

describe('useRaceClock', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useHorsesStore().populate(createRandom(1))
    useRaceStore().configure({ seed: 1 })
  })

  it('ticks the race only while it is running', async () => {
    const manual = createManualTicker()
    const race = useRaceStore()
    const scope = effectScope()
    scope.run(() => {
      useRaceClock(manual.ticker)
    })

    expect(manual.running).toBe(false)

    race.generateProgram()
    race.start()
    await nextTick()
    expect(manual.running).toBe(true)

    manual.advance(0.5)
    expect(race.elapsed).toBeGreaterThan(0)

    race.pause()
    await nextTick()
    expect(manual.running).toBe(false)

    scope.stop()
  })

  it('stops the ticker when its owner is unmounted', async () => {
    const manual = createManualTicker()
    const race = useRaceStore()
    const scope = effectScope()
    scope.run(() => {
      useRaceClock(manual.ticker)
    })

    race.generateProgram()
    race.start()
    await nextTick()
    scope.stop()

    expect(manual.running).toBe(false)
  })
})
