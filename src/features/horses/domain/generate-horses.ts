import { randomInt, sample, type RandomSource } from '@/shared/lib/random'

import type { Horse } from './horse'
import { HORSE_NAMES } from './horse-names'
import { HORSE_PALETTE } from './horse-palette'
import { HORSE_RULES, type HorseRules } from './horse.rules'

export function generateHorses(random: RandomSource, rules: HorseRules = HORSE_RULES): Horse[] {
  if (rules.count > HORSE_PALETTE.length || rules.count > HORSE_NAMES.length) {
    throw new RangeError(
      `Cannot create ${rules.count} unique horses from ${HORSE_PALETTE.length} colors and ${HORSE_NAMES.length} names`,
    )
  }

  const names = sample(random, HORSE_NAMES, rules.count)
  const colors = sample(random, HORSE_PALETTE, rules.count)

  return names.map((name, index) => ({
    id: index + 1,
    name,
    color: colors[index] as Horse['color'],
    condition: randomInt(random, rules.condition.min, rules.condition.max),
  }))
}
