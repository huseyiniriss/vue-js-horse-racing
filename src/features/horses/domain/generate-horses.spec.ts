import { describe, expect, it } from 'vitest'

import { createRandom } from '@/shared/lib/random'

import { generateHorses } from './generate-horses'
import { HORSE_RULES } from './horse.rules'

const SEEDS = [1, 42, 1337, 2026]

describe('generateHorses', () => {
  it('rule: the game has a total of 20 horses', () => {
    expect(generateHorses(createRandom(1))).toHaveLength(20)
  })

  it.each(SEEDS)('rule: every horse has a unique color (seed %i)', (seed) => {
    const horses = generateHorses(createRandom(seed))
    expect(new Set(horses.map((horse) => horse.color.hex)).size).toBe(horses.length)
  })

  it.each(SEEDS)('rule: condition is an integer between 1 and 100 (seed %i)', (seed) => {
    for (const { condition } of generateHorses(createRandom(seed))) {
      expect(Number.isInteger(condition)).toBe(true)
      expect(condition).toBeGreaterThanOrEqual(1)
      expect(condition).toBeLessThanOrEqual(100)
    }
  })

  it('gives every horse a unique id and name', () => {
    const horses = generateHorses(createRandom(5))
    expect(new Set(horses.map((horse) => horse.id)).size).toBe(20)
    expect(new Set(horses.map((horse) => horse.name)).size).toBe(20)
  })

  it('is reproducible from a seed', () => {
    expect(generateHorses(createRandom(99))).toEqual(generateHorses(createRandom(99)))
  })

  it('respects custom rules', () => {
    const horses = generateHorses(createRandom(3), { count: 5, condition: { min: 40, max: 40 } })
    expect(horses).toHaveLength(5)
    expect(horses.every((horse) => horse.condition === 40)).toBe(true)
  })

  it('refuses a stable larger than the palette allows', () => {
    expect(() => generateHorses(createRandom(1), { ...HORSE_RULES, count: 21 })).toThrow(RangeError)
  })
})
