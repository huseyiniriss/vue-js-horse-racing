import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { useHorsesStore } from '@/features/horses'
import { useRaceStore } from '@/features/race'

import { bootstrapGame, replayUrl, resolveSession } from './bootstrap'

const location = { origin: 'https://example.com', pathname: '/race/' }

describe('resolveSession', () => {
  const newSeed = () => 7

  it('reads the seed and program from the URL', () => {
    expect(resolveSession('?seed=42&program=3', newSeed)).toEqual({ seed: 42, firstProgram: 3 })
  })

  it('defaults to the first program', () => {
    expect(resolveSession('?seed=42', newSeed)).toEqual({ seed: 42, firstProgram: 1 })
  })

  it.each(['', '?seed=', '?seed=abc', '?seed=-1', '?seed=1.5', '?seed=99999999999'])(
    'falls back to a fresh seed for %j',
    (search) => {
      expect(resolveSession(search, newSeed)).toEqual({ seed: 7, firstProgram: 1 })
    },
  )

  it.each(['?seed=42&program=0', '?seed=42&program=x', '?program=3'])(
    'ignores an invalid or orphan program in %j',
    (search) => {
      expect(resolveSession(search, newSeed).firstProgram).toBe(1)
    },
  )
})

describe('replayUrl', () => {
  it('links the first program by seed alone', () => {
    expect(replayUrl({ seed: 42, program: 1 }, location)).toBe('https://example.com/race/?seed=42')
  })

  it('adds the program number for later programs', () => {
    expect(replayUrl({ seed: 42, program: 3 }, location)).toBe(
      'https://example.com/race/?seed=42&program=3',
    )
  })

  it('round-trips through resolveSession', () => {
    const url = new URL(replayUrl({ seed: 9, program: 4 }, location))
    expect(resolveSession(url.search)).toEqual({ seed: 9, firstProgram: 4 })
  })
})

describe('bootstrapGame', () => {
  it('fills the stable and configures the race from one seed', () => {
    const pinia = createPinia()
    bootstrapGame(pinia, { seed: 42, firstProgram: 1 })
    expect(useHorsesStore(pinia).horses).toHaveLength(20)
    expect(useRaceStore(pinia).seed).toBe(42)
  })

  it('is reproducible', () => {
    const a = createPinia()
    const b = createPinia()
    bootstrapGame(a, { seed: 42, firstProgram: 1 })
    bootstrapGame(b, { seed: 42, firstProgram: 1 })
    expect(useHorsesStore(a).horses).toEqual(useHorsesStore(b).horses)
  })
})
