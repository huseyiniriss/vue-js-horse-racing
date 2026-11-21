import type { HorseId } from '@/features/horses'
import { sample, type RandomSource } from '@/shared/lib/random'

import type { RaceRules } from './race.rules'

export interface Round {
  /** Zero-based position in the program. */
  readonly index: number
  /** Metres. */
  readonly distance: number
  /** Horse ids in lane order: lanes[0] runs in lane 1. */
  readonly lanes: readonly HorseId[]
}

export type Schedule = readonly Round[]

/** Builds the race program: one round per configured distance, each with its own random field. */
export function generateSchedule(
  horseIds: readonly HorseId[],
  random: RandomSource,
  rules: Pick<RaceRules, 'roundDistances' | 'horsesPerRound'>,
): Schedule {
  if (horseIds.length < rules.horsesPerRound) {
    throw new RangeError(
      `A round needs ${rules.horsesPerRound} horses but only ${horseIds.length} are available`,
    )
  }

  return rules.roundDistances.map((distance, index) => ({
    index,
    distance,
    lanes: sample(random, horseIds, rules.horsesPerRound),
  }))
}
