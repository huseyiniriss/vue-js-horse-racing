import { describe, expect, it } from 'vitest'

import { createRandom, deriveSeed, randomInt, sample, shuffle } from './random'

describe('createRandom', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createRandom(42)
    const b = createRandom(42)
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b))
  })

  it('produces different sequences for different seeds', () => {
    expect(createRandom(1)()).not.toBe(createRandom(2)())
  })

  it('stays within [0, 1)', () => {
    const random = createRandom(7)
    for (let i = 0; i < 10_000; i++) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('deriveSeed', () => {
  it('is stable and label-sensitive', () => {
    expect(deriveSeed(42, 'horses')).toBe(deriveSeed(42, 'horses'))
    expect(deriveSeed(42, 'horses')).not.toBe(deriveSeed(42, 'program'))
    expect(deriveSeed(42, 'round', 1)).not.toBe(deriveSeed(42, 'round', 2))
  })
})

describe('randomInt', () => {
  it('covers the whole inclusive range', () => {
    const random = createRandom(3)
    const seen = new Set(Array.from({ length: 2_000 }, () => randomInt(random, 1, 6)))
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('rejects an invalid range', () => {
    expect(() => randomInt(createRandom(1), 5, 1)).toThrow(RangeError)
    expect(() => randomInt(createRandom(1), 0.5, 1)).toThrow(RangeError)
  })
})

describe('shuffle and sample', () => {
  const items = Array.from({ length: 20 }, (_, i) => i)

  it('shuffle keeps every item and does not mutate the input', () => {
    const copy = [...items]
    const result = shuffle(createRandom(9), items)
    expect(items).toEqual(copy)
    expect([...result].sort((a, b) => a - b)).toEqual(items)
  })

  it('sample returns distinct items of the requested size', () => {
    const result = sample(createRandom(9), items, 10)
    expect(result).toHaveLength(10)
    expect(new Set(result).size).toBe(10)
  })

  it('sample refuses to take more than available', () => {
    expect(() => sample(createRandom(9), items, 21)).toThrow(RangeError)
  })
})
