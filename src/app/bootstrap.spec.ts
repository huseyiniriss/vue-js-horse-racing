import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { useHorsesStore } from '@/features/horses'
import { useRaceStore } from '@/features/race'

import { bootstrapGame, replayUrl, resolveSeed } from './bootstrap'

describe('resolveSeed', () => {
  const fallback = () => 7

  it('reads a numeric seed from the URL', () => {
    expect(resolveSeed('?seed=42', fallback)).toBe(42)
  })

  it.each(['', '?seed=', '?seed=abc', '?seed=-1', '?seed=1.5', '?seed=99999999999'])(
    'falls back to a fresh seed for %j',
    (search) => {
      expect(resolveSeed(search, fallback)).toBe(7)
    },
  )
})

describe('replayUrl', () => {
  it('builds a shareable link for the seed', () => {
    expect(replayUrl(42, { origin: 'https://example.com', pathname: '/race/' })).toBe(
      'https://example.com/race/?seed=42',
    )
  })
})

describe('bootstrapGame', () => {
  it('fills the stable and configures the race from one seed', () => {
    const pinia = createPinia()
    bootstrapGame(pinia, 42)
    expect(useHorsesStore(pinia).horses).toHaveLength(20)
    expect(useRaceStore(pinia).seed).toBe(42)
  })

  it('is reproducible', () => {
    const a = createPinia()
    const b = createPinia()
    bootstrapGame(a, 42)
    bootstrapGame(b, 42)
    expect(useHorsesStore(a).horses).toEqual(useHorsesStore(b).horses)
  })
})
