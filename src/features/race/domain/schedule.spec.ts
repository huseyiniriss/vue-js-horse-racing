import { describe, expect, it } from 'vitest'

import { createRandom } from '@/shared/lib/random'

import { RACE_RULES } from './race.rules'
import { generateSchedule } from './schedule'

const HORSE_IDS = Array.from({ length: 20 }, (_, i) => i + 1)

describe('generateSchedule', () => {
  const schedule = generateSchedule(HORSE_IDS, createRandom(42), RACE_RULES)

  it('rule: a race day has 6 rounds', () => {
    expect(schedule).toHaveLength(6)
  })

  it('rule: rounds run at 1200, 1400, 1600, 1800, 2000 and 2200 metres, in order', () => {
    expect(schedule.map((round) => round.distance)).toEqual([1200, 1400, 1600, 1800, 2000, 2200])
    expect(schedule.map((round) => round.index)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('rule: each round has 10 distinct horses picked from the 20', () => {
    for (const round of schedule) {
      expect(round.lanes).toHaveLength(10)
      expect(new Set(round.lanes).size).toBe(10)
      expect(round.lanes.every((id) => HORSE_IDS.includes(id))).toBe(true)
    }
  })

  it('draws a different field for each round', () => {
    const fields = new Set(schedule.map((round) => [...round.lanes].sort().join(',')))
    expect(fields.size).toBeGreaterThan(1)
  })

  it('is reproducible from a seed', () => {
    expect(generateSchedule(HORSE_IDS, createRandom(42), RACE_RULES)).toEqual(schedule)
  })

  it('follows the configured distances, so a 7th round is a config change', () => {
    const rules = { ...RACE_RULES, roundDistances: [...RACE_RULES.roundDistances, 2400] }
    expect(generateSchedule(HORSE_IDS, createRandom(1), rules).at(-1)?.distance).toBe(2400)
  })

  it('refuses a field larger than the stable', () => {
    expect(() => generateSchedule(HORSE_IDS.slice(0, 9), createRandom(1), RACE_RULES)).toThrow(
      RangeError,
    )
  })
})
