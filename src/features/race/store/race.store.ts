import { defineStore } from 'pinia'
import { computed, readonly, ref, shallowRef } from 'vue'

import { useHorsesStore, type HorseId } from '@/features/horses'
import { createRandom, deriveSeed } from '@/shared/lib/random'

import {
  distanceCovered,
  rankRunners,
  simulateRound,
  type RoundResult,
  type RoundSimulation,
} from '../domain/race-engine'
import { canTransition, transition, type RaceEvent, type RaceStatus } from '../domain/race-status'
import { RACE_RULES, type RaceRules } from '../domain/race.rules'
import { generateSchedule, type Round, type Schedule } from '../domain/schedule'
import { RACE_TIMING, type RaceTiming } from './race.timing'

export interface LaneState {
  readonly lane: number
  readonly horseId: HorseId
  /** 0 at the gate, 1 at the finish line. */
  readonly progress: number
  readonly finished: boolean
  /** Finishing position, revealed once the horse crosses the line. */
  readonly position: number | null
}

/** The one action the Start/Pause button performs in the current status, if any. */
export type PlaybackAction = Extract<RaceEvent, 'start' | 'pause' | 'resume'>

export interface RaceConfig {
  readonly seed: number
  /** Program number the next Generate draws (1-based). Lets a URL replay any program. */
  readonly firstProgram?: number
  readonly rules?: RaceRules
  readonly timing?: RaceTiming
}

export const useRaceStore = defineStore('race', () => {
  const horses = useHorsesStore()

  // Configuration: set at bootstrap, only while nothing has been generated.
  const seed = ref(0)
  const rules = shallowRef<RaceRules>(RACE_RULES)
  const timing = shallowRef<RaceTiming>(RACE_TIMING)

  // State. Immutable structures use shallowRef: they are replaced, never mutated.
  const status = ref<RaceStatus>('idle')
  /** Number of the program on screen (0 before the first Generate). */
  const programNumber = ref(0)
  const schedule = shallowRef<Schedule>([])
  const currentRoundIndex = ref(0)
  /** The engine's decision for the round being run. Internal: the UI reads `lanes`. */
  const simulation = shallowRef<RoundSimulation | null>(null)
  /** Race seconds since the current round started: the only value that changes per frame. */
  const elapsed = ref(0)
  const results = shallowRef<readonly RoundResult[]>([])

  // Getters
  const currentRound = computed<Round | null>(() => schedule.value[currentRoundIndex.value] ?? null)
  const roundCount = computed(() => rules.value.roundDistances.length)
  const laneCount = computed(() => rules.value.horsesPerRound)
  const canGenerate = computed(() => canTransition(status.value, 'generate'))

  const playbackAction = computed<PlaybackAction | null>(() => {
    const actions: PlaybackAction[] = ['start', 'pause', 'resume']
    return actions.find((action) => canTransition(status.value, action)) ?? null
  })

  const isCurrentRoundSettled = computed(
    () => results.value.at(-1)?.roundIndex === currentRoundIndex.value,
  )

  /** Final order of the current round. Computed once per round, not per frame. */
  const positionsByHorse = computed(() => {
    const sim = simulation.value
    if (!sim) return new Map<HorseId, number>()
    return new Map(rankRunners(sim).placings.map((placing) => [placing.horseId, placing.position]))
  })

  const lanes = computed<readonly LaneState[]>(() => {
    const sim = simulation.value
    if (sim) {
      return sim.runners.map((runner) => {
        const finished = elapsed.value >= runner.finishTime
        return {
          lane: runner.lane,
          horseId: runner.horseId,
          progress: distanceCovered(runner, sim.segmentLength, elapsed.value) / sim.distance,
          finished,
          position: finished ? (positionsByHorse.value.get(runner.horseId) ?? null) : null,
        }
      })
    }
    // Before the start the next field waits at the gate.
    return (currentRound.value?.lanes ?? []).map((horseId, index) => ({
      lane: index + 1,
      horseId,
      progress: 0,
      finished: false,
      position: null,
    }))
  })

  // Actions
  function configure(config: RaceConfig): void {
    if (status.value !== 'idle') {
      throw new Error('The race can only be configured before a program is generated')
    }
    seed.value = config.seed
    programNumber.value = Math.max(0, (config.firstProgram ?? 1) - 1)
    if (config.rules) rules.value = config.rules
    if (config.timing) timing.value = config.timing
  }

  function generateProgram(): void {
    status.value = transition(status.value, 'generate')
    programNumber.value += 1
    schedule.value = generateSchedule(
      horses.horseIds,
      createRandom(deriveSeed(seed.value, 'program', programNumber.value)),
      rules.value,
    )
    results.value = []
    resetRound(0)
  }

  function start(): void {
    status.value = transition(status.value, 'start')
    beginRound(0)
  }

  function pause(): void {
    status.value = transition(status.value, 'pause')
  }

  function resume(): void {
    status.value = transition(status.value, 'resume')
  }

  /** Start/Pause button: performs whatever playback action is currently allowed. */
  function togglePlayback(): void {
    const handlers: Record<PlaybackAction, () => void> = { start, pause, resume }
    if (playbackAction.value) handlers[playbackAction.value]()
  }

  /** Advances the race by `realSeconds` of wall-clock time. Driven by the race clock. */
  function tick(realSeconds: number): void {
    const sim = simulation.value
    if (status.value !== 'running' || !sim || realSeconds <= 0) return

    elapsed.value += realSeconds * timing.value.playbackRate
    if (elapsed.value < sim.duration) return

    // The last horse is home: the round's result is final.
    if (!isCurrentRoundSettled.value) {
      results.value = [...results.value, rankRunners(sim)]
    }

    const isLastRound = sim.roundIndex === schedule.value.length - 1
    if (isLastRound) {
      status.value = transition(status.value, 'complete')
      return
    }

    // Keep the finished field on screen for the intermission, then line up the next round.
    const intermission = timing.value.intermissionSeconds * timing.value.playbackRate
    if (elapsed.value >= sim.duration + intermission) {
      beginRound(sim.roundIndex + 1)
    }
  }

  function resetRound(index: number): void {
    currentRoundIndex.value = index
    simulation.value = null
    elapsed.value = 0
  }

  function beginRound(index: number): void {
    const round = schedule.value[index]
    if (!round) throw new Error(`Round ${index + 1} is not in the program`)

    resetRound(index)
    simulation.value = simulateRound(
      round,
      (horseId) => horses.getHorse(horseId).condition,
      createRandom(deriveSeed(seed.value, 'program', programNumber.value, 'round', index)),
      rules.value.pace,
    )
  }

  // State is exposed read-only: it changes through actions only, so the status machine
  // cannot be bypassed from a component.
  return {
    // state
    seed: readonly(seed),
    status: readonly(status),
    programNumber: readonly(programNumber),
    schedule: readonly(schedule),
    currentRoundIndex: readonly(currentRoundIndex),
    elapsed: readonly(elapsed),
    results: readonly(results),
    // getters
    currentRound,
    roundCount,
    laneCount,
    lanes,
    canGenerate,
    playbackAction,
    // actions
    configure,
    generateProgram,
    start,
    pause,
    resume,
    togglePlayback,
    tick,
  }
})
