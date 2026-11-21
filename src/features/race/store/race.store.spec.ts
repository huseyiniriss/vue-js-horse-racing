import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useHorsesStore } from '@/features/horses'
import { createRandom } from '@/shared/lib/random'

import { useRaceStore } from './race.store'

const SEED = 2026
const FRAME = 1 / 60

function setup(seed = SEED) {
  setActivePinia(createPinia())
  useHorsesStore().populate(createRandom(seed))
  const race = useRaceStore()
  race.configure({ seed })
  return race
}

type RaceStore = ReturnType<typeof setup>

/** Feeds frames until `done` holds. Guards against infinite loops. */
function runUntil(race: RaceStore, done: () => boolean, frame = FRAME) {
  for (let i = 0; i < 100_000 && !done(); i++) race.tick(frame)
  if (!done()) throw new Error('Condition never reached')
}

describe('race store', () => {
  let race: RaceStore

  beforeEach(() => {
    race = setup()
  })

  describe('before a program exists', () => {
    it('is idle with nothing on the track', () => {
      expect(race.status).toBe('idle')
      expect(race.lanes).toEqual([])
      expect(race.canGenerate).toBe(true)
      expect(race.playbackAction).toBeNull()
    })

    it('rejects start', () => {
      expect(() => {
        race.start()
      }).toThrow('"start" is not allowed while the race is "idle"')
    })
  })

  describe('generateProgram', () => {
    it('creates 6 rounds and lines up the first field at the gate', () => {
      race.generateProgram()

      expect(race.status).toBe('ready')
      expect(race.schedule).toHaveLength(6)
      expect(race.results).toEqual([])
      expect(race.lanes.map((lane) => lane.horseId)).toEqual(race.schedule[0]!.lanes)
      expect(race.lanes.every((lane) => lane.progress === 0)).toBe(true)
      expect(race.playbackAction).toBe('start')
    })

    it('draws a new program every time', () => {
      race.generateProgram()
      const first = race.schedule
      race.generateProgram()
      expect(race.schedule).not.toEqual(first)
    })

    it('is blocked while a race is running or paused', () => {
      race.generateProgram()
      race.start()
      expect(race.canGenerate).toBe(false)
      expect(() => {
        race.generateProgram()
      }).toThrow('"generate" is not allowed while the race is "running"')

      race.pause()
      expect(race.canGenerate).toBe(false)
    })

    it('can start a fresh race day once the previous one is finished', () => {
      race.configure({ seed: SEED, timing: { playbackRate: 100, intermissionSeconds: 0 } })
      race.generateProgram()
      race.start()
      runUntil(race, () => race.status === 'finished')

      race.generateProgram()
      expect(race.status).toBe('ready')
      expect(race.results).toEqual([])
      expect(race.currentRoundIndex).toBe(0)
    })
  })

  describe('playback', () => {
    beforeEach(() => {
      race.generateProgram()
    })

    it('moves horses only while running', () => {
      race.tick(1)
      expect(race.elapsed).toBe(0)

      race.start()
      race.tick(1)
      expect(race.elapsed).toBeGreaterThan(0)
      expect(race.lanes.some((lane) => lane.progress > 0)).toBe(true)
    })

    it('resumes exactly where it paused', () => {
      race.start()
      race.tick(2)
      race.pause()
      const frozen = race.lanes

      race.tick(5)
      expect(race.lanes).toEqual(frozen)

      race.resume()
      expect(race.lanes).toEqual(frozen)
      race.tick(FRAME)
      expect(race.elapsed).toBeGreaterThan(0)
    })

    it('the Start/Pause button cycles start → pause → resume', () => {
      race.togglePlayback()
      expect(race.status).toBe('running')
      race.togglePlayback()
      expect(race.status).toBe('paused')
      race.togglePlayback()
      expect(race.status).toBe('running')
    })

    it('ignores non-positive deltas', () => {
      race.start()
      race.tick(0)
      race.tick(-1)
      expect(race.elapsed).toBe(0)
    })
  })

  describe('results', () => {
    beforeEach(() => {
      race.generateProgram()
      race.start()
    })

    it('rule: a round result appears when its race concludes, not before', () => {
      runUntil(race, () => race.lanes.some((lane) => lane.finished))
      expect(race.results).toHaveLength(0)

      runUntil(race, () => race.lanes.every((lane) => lane.finished))
      expect(race.results).toHaveLength(1)
      expect(race.results[0]!.distance).toBe(1200)
    })

    it('the result matches the order horses crossed the line', () => {
      const crossed: number[] = []
      runUntil(race, () => {
        for (const lane of race.lanes) {
          if (lane.finished && !crossed.includes(lane.horseId)) crossed.push(lane.horseId)
        }
        return race.results.length === 1
      })
      expect(race.results[0]!.placings.map((placing) => placing.horseId)).toEqual(crossed)
    })

    it('rule: rounds run one at a time and results arrive sequentially', () => {
      const seenRounds: number[] = []
      runUntil(race, () => {
        if (seenRounds.at(-1) !== race.currentRoundIndex) seenRounds.push(race.currentRoundIndex)
        return race.status === 'finished'
      })

      expect(seenRounds).toEqual([0, 1, 2, 3, 4, 5])
      expect(race.results.map((result) => result.distance)).toEqual([
        1200, 1400, 1600, 1800, 2000, 2200,
      ])
      expect(race.results.map((result) => result.roundIndex)).toEqual([0, 1, 2, 3, 4, 5])
      expect(race.playbackAction).toBeNull()
    })

    it('waits for the intermission before starting the next round', () => {
      runUntil(race, () => race.results.length === 1)
      expect(race.currentRoundIndex).toBe(0)
      race.tick(1.6)
      expect(race.currentRoundIndex).toBe(1)
      expect(race.elapsed).toBe(0)
    })

    it('reveals each finishing position on the track as the horse crosses the line', () => {
      runUntil(race, () => race.lanes.some((lane) => lane.finished))
      const finished = race.lanes.filter((lane) => lane.finished)
      expect(finished.map((lane) => lane.position)).toEqual([1])
      expect(
        race.lanes.filter((lane) => !lane.finished).every((lane) => lane.position === null),
      ).toBe(true)
    })

    it('declares the race day complete as soon as the last round is settled', () => {
      runUntil(race, () => race.results.length === 6)
      expect(race.status).toBe('finished')
      expect(race.playbackAction).toBeNull()
    })

    it('handles a huge frame without losing a result', () => {
      race.tick(10_000)
      expect(race.results).toHaveLength(1)
      expect(race.currentRoundIndex).toBe(1)
    })
  })

  describe('configuration and encapsulation', () => {
    it('can only be configured before a program is generated', () => {
      race.generateProgram()
      expect(() => {
        race.configure({ seed: 1 })
      }).toThrow('only be configured before a program is generated')
    })

    it('exposes state read-only, so the status machine cannot be bypassed', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      const writable = race as unknown as { status: string }
      writable.status = 'finished'
      expect(race.status).toBe('idle')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('target is readonly'),
        expect.anything(),
      )
    })

    it('replays a specific program of the day from its number', () => {
      const original = setup(5)
      original.generateProgram()
      original.generateProgram()
      original.generateProgram()
      expect(original.programNumber).toBe(3)

      const replay = setup(5)
      replay.configure({ seed: 5, firstProgram: 3 })
      replay.generateProgram()
      expect(replay.programNumber).toBe(3)
      expect(replay.schedule).toEqual(original.schedule)
    })
  })

  it('replays the same race day from the same seed, at any frame rate', () => {
    const play = (frame: number) => {
      const store = setup(77)
      store.generateProgram()
      store.start()
      runUntil(store, () => store.status === 'finished', frame)
      return store.results
    }

    const at60 = play(1 / 60)
    expect(play(1 / 60)).toEqual(at60)
    expect(play(1 / 24)).toEqual(at60)
    expect(play(1 / 144)).toEqual(at60)
  })
})
