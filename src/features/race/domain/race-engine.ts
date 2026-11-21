import type { HorseId } from '@/features/horses'
import { randomBetween, type RandomSource } from '@/shared/lib/random'

import type { PaceModel } from './race.rules'
import type { Round } from './schedule'

/**
 * The race engine decides a round *before* it is animated.
 *
 * Each runner gets a pace per segment of the track. From that, both the finishing
 * order and the position at any moment are pure functions of time. The animation
 * only asks "where is this horse at t?", so what you see always matches the
 * result, at any frame rate, and pausing is simply not advancing t.
 */

export interface Runner {
  readonly horseId: HorseId
  /** 1-based lane number. */
  readonly lane: number
  /** Metres per second for each segment of the round. */
  readonly segmentSpeeds: readonly number[]
  /** Seconds of race time to cross the finish line. */
  readonly finishTime: number
}

export interface RoundSimulation {
  readonly roundIndex: number
  readonly distance: number
  readonly segmentLength: number
  readonly runners: readonly Runner[]
  /** Race time when the last runner finishes. */
  readonly duration: number
}

export interface Placing {
  /** 1-based finishing position. */
  readonly position: number
  readonly horseId: HorseId
  readonly finishTime: number
}

export interface RoundResult {
  readonly roundIndex: number
  readonly distance: number
  readonly placings: readonly Placing[]
}

export type ConditionLookup = (horseId: HorseId) => number

const CONDITION_MIDPOINT = 50

export function simulateRound(
  round: Round,
  conditionOf: ConditionLookup,
  random: RandomSource,
  pace: PaceModel,
): RoundSimulation {
  const segmentLength = round.distance / pace.segmentCount

  const runners = round.lanes.map((horseId, laneIndex): Runner => {
    const conditionFactor =
      1 + (pace.conditionWeight * (conditionOf(horseId) - CONDITION_MIDPOINT)) / CONDITION_MIDPOINT
    const form = 1 + randomBetween(random, -pace.formVariance, pace.formVariance)
    const averageSpeed = pace.baseSpeed * conditionFactor * form

    const segmentSpeeds = Array.from(
      { length: pace.segmentCount },
      () => averageSpeed * (1 + randomBetween(random, -pace.segmentVariance, pace.segmentVariance)),
    )
    const finishTime = segmentSpeeds.reduce((total, speed) => total + segmentLength / speed, 0)

    return { horseId, lane: laneIndex + 1, segmentSpeeds, finishTime }
  })

  return {
    roundIndex: round.index,
    distance: round.distance,
    segmentLength,
    runners,
    duration: Math.max(...runners.map((runner) => runner.finishTime)),
  }
}

/** Metres covered by a runner after `time` seconds of race time, clamped to the finish line. */
export function distanceCovered(runner: Runner, segmentLength: number, time: number): number {
  let remaining = Math.max(0, time)
  let covered = 0

  for (const speed of runner.segmentSpeeds) {
    const segmentTime = segmentLength / speed
    if (remaining < segmentTime) {
      return covered + remaining * speed
    }
    remaining -= segmentTime
    covered += segmentLength
  }

  return covered
}

/** Finishing order. Ties (practically impossible with float times) go to the inner lane. */
export function rankRunners(simulation: RoundSimulation): RoundResult {
  const ordered = [...simulation.runners].sort(
    (a, b) => a.finishTime - b.finishTime || a.lane - b.lane,
  )

  return {
    roundIndex: simulation.roundIndex,
    distance: simulation.distance,
    placings: ordered.map((runner, index) => ({
      position: index + 1,
      horseId: runner.horseId,
      finishTime: runner.finishTime,
    })),
  }
}
