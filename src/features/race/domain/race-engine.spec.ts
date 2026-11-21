import { describe, expect, it } from 'vitest'

import { createRandom, deriveSeed } from '@/shared/lib/random'

import { distanceCovered, rankRunners, simulateRound, type RoundSimulation } from './race-engine'
import { RACE_RULES } from './race.rules'
import type { Round } from './schedule'

const { pace } = RACE_RULES
const LANES = Array.from({ length: 10 }, (_, i) => i + 1)
const round: Round = { index: 0, distance: 1200, lanes: LANES }
const conditionOf = (id: number) => id * 10

function simulate(seed: number, target: Round = round, conditions = conditionOf): RoundSimulation {
  return simulateRound(target, conditions, createRandom(seed), pace)
}

describe('simulateRound', () => {
  const simulation = simulate(42)

  it('puts every horse of the round in its lane', () => {
    expect(simulation.runners.map((runner) => runner.horseId)).toEqual(LANES)
    expect(simulation.runners.map((runner) => runner.lane)).toEqual(LANES)
  })

  it('splits the distance into equal segments', () => {
    expect(simulation.segmentLength * pace.segmentCount).toBeCloseTo(round.distance)
    for (const runner of simulation.runners) {
      expect(runner.segmentSpeeds).toHaveLength(pace.segmentCount)
    }
  })

  it('lasts until the slowest horse finishes', () => {
    const slowest = Math.max(...simulation.runners.map((runner) => runner.finishTime))
    expect(simulation.duration).toBe(slowest)
  })

  it('produces realistic race times (around baseSpeed)', () => {
    const expected = round.distance / pace.baseSpeed
    for (const runner of simulation.runners) {
      expect(runner.finishTime).toBeGreaterThan(expected * 0.85)
      expect(runner.finishTime).toBeLessThan(expected * 1.15)
    }
  })

  it('is reproducible from a seed', () => {
    expect(simulate(42)).toEqual(simulation)
    expect(simulate(43)).not.toEqual(simulation)
  })
})

describe('distanceCovered', () => {
  const { runners, segmentLength } = simulate(7)

  it('starts at the gate and stops at the finish line', () => {
    for (const runner of runners) {
      expect(distanceCovered(runner, segmentLength, -1)).toBe(0)
      expect(distanceCovered(runner, segmentLength, 0)).toBe(0)
      expect(distanceCovered(runner, segmentLength, runner.finishTime + 60)).toBeCloseTo(1200)
    }
  })

  it('reaches the finish line exactly at the finish time', () => {
    for (const runner of runners) {
      expect(distanceCovered(runner, segmentLength, runner.finishTime - 0.001)).toBeLessThan(1200)
      expect(distanceCovered(runner, segmentLength, runner.finishTime)).toBeCloseTo(1200, 6)
    }
  })

  it('never moves a horse backwards', () => {
    for (const runner of runners) {
      let previous = 0
      for (let t = 0; t <= runner.finishTime + 1; t += 0.25) {
        const current = distanceCovered(runner, segmentLength, t)
        expect(current).toBeGreaterThanOrEqual(previous)
        previous = current
      }
    }
  })

  it('lets horses overtake each other (pace changes between segments)', () => {
    const leaderAt = (t: number) =>
      [...runners].sort(
        (a, b) => distanceCovered(b, segmentLength, t) - distanceCovered(a, segmentLength, t),
      )[0]?.horseId
    const leaders = new Set<number | undefined>()
    for (let t = 1; t < 80; t += 1) leaders.add(leaderAt(t))
    expect(leaders.size).toBeGreaterThan(1)
  })
})

describe('rankRunners', () => {
  it('orders by finish time with 1-based positions', () => {
    const result = rankRunners(simulate(11))
    expect(result.placings.map((placing) => placing.position)).toEqual(LANES)
    const times = result.placings.map((placing) => placing.finishTime)
    expect(times).toEqual([...times].sort((a, b) => a - b))
  })

  it('agrees with what is drawn: a finished horse always ranks ahead of a running one', () => {
    const simulation = simulate(23)
    const positionOf = new Map(
      rankRunners(simulation).placings.map((placing) => [placing.horseId, placing.position]),
    )

    for (let t = 0; t <= simulation.duration; t += 0.05) {
      const finished = simulation.runners.filter((runner) => runner.finishTime <= t)
      const running = simulation.runners.filter((runner) => runner.finishTime > t)
      for (const done of finished) {
        for (const other of running) {
          expect(positionOf.get(done.horseId)).toBeLessThan(positionOf.get(other.horseId)!)
        }
      }
    }
  })

  it('is independent of frame rate: accumulated frames match direct evaluation', () => {
    const simulation = simulate(31)
    const target = simulation.duration * 0.6

    for (const fps of [24, 60, 144]) {
      let elapsed = 0
      while (elapsed < target) elapsed = Math.min(target, elapsed + 1 / fps)

      for (const runner of simulation.runners) {
        expect(distanceCovered(runner, simulation.segmentLength, elapsed)).toBeCloseTo(
          distanceCovered(runner, simulation.segmentLength, target),
          6,
        )
      }
    }
  })
})

describe('condition matters, but luck still plays a part', () => {
  /** Win rate of horse 1 against horse 2 when both race 1000 times in a field of condition-50 horses. */
  function headToHead(strong: number, weak: number): number {
    const conditions = (id: number) => (id === 1 ? strong : id === 2 ? weak : 50)
    let wins = 0
    const runs = 1000
    for (let i = 0; i < runs; i++) {
      const { placings } = rankRunners(
        simulateRound(round, conditions, createRandom(deriveSeed('h2h', i)), pace),
      )
      const position = (id: number) => placings.find((placing) => placing.horseId === id)!.position
      if (position(1) < position(2)) wins++
    }
    return wins / runs
  }

  it('a much fitter horse almost always beats a much weaker one', () => {
    expect(headToHead(90, 10)).toBeGreaterThan(0.95)
  })

  it('a slightly fitter horse wins more often, but not always', () => {
    const rate = headToHead(60, 50)
    expect(rate).toBeGreaterThan(0.55)
    expect(rate).toBeLessThan(0.9)
  })
})
