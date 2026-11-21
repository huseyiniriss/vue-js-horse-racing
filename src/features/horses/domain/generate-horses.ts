import { pickContrasting } from '@/shared/lib/color'
import { randomInt, sample, shuffle, type RandomSource } from '@/shared/lib/random'

import { SILKS_PATTERNS, type Horse, type HorseColor } from './horse'
import { HORSE_NAMES } from './horse-names'
import { HORSE_PALETTE } from './horse-palette'
import { HORSE_RULES, type HorseRules } from './horse.rules'

const SILKS_TRIM_LIGHT = '#FFFFFF'
const SILKS_TRIM_DARK = '#17251C'

export function generateHorses(random: RandomSource, rules: HorseRules = HORSE_RULES): Horse[] {
  if (rules.count > HORSE_PALETTE.length || rules.count > HORSE_NAMES.length) {
    throw new RangeError(
      `Cannot create ${rules.count} unique horses from ${HORSE_PALETTE.length} colors and ${HORSE_NAMES.length} names`,
    )
  }

  const names = sample(random, HORSE_NAMES, rules.count)
  const colors = sample(random, HORSE_PALETTE, rules.count)
  const patterns = shuffle(random, SILKS_PATTERNS)

  return names.map((name, index) => {
    const color = colors[index] as HorseColor
    return {
      id: index + 1,
      name,
      color,
      silks: {
        // Patterns repeat across the stable; the body color keeps every horse unique.
        pattern: patterns[index % patterns.length] ?? 'hoops',
        body: color.hex,
        trim: pickContrasting(color.hex, SILKS_TRIM_LIGHT, SILKS_TRIM_DARK),
      },
      condition: randomInt(random, rules.condition.min, rules.condition.max),
    }
  })
}
