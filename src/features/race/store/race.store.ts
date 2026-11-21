import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'

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
}

/** The one action the Start/Pause button performs in the current status, if any. */
export type PlaybackAction = Extract<RaceEvent, 'start' | 'pause' | 'resume'>

export const useRaceStore = defineStore('race', () => {
  const horses = useHorsesStore()

  // Configuration (set once at bootstrap, overridable in tests).
  const seed = ref(0)
  const rules = shallowRef<RaceRules>(RACE_RULES)
  const timing = shallowRef<RaceTiming>(RACE_TIMING)

  // State. Large immutable structures use shallowRef: they are replaced, never mutated.
  const status = ref<RaceStatus>('idle')
  const programNumber = ref(0)
  const schedule = shallowRef<Schedule>([])
  const currentRoundIndex = ref(0)
  const simulation = shallowRef<RoundSimulation | null>(null)
  /** Race seconds since the current round started. The only value that changes every frame. */
  const elapsed = ref(0)
  const results = shallowRef<readonly RoundResult[]>([])

  // Getters
  const currentRound = computed<Round | null>(() => schedule.value[currentRoundIndex.value] ?? null)
  const canGenerate = computed(() => canTransition(status.value, 'generate'))

  const playbackAction = computed<PlaybackAction | null>(() => {
    const actions: PlaybackAction[] = ['start', 'pause', 'resume']
    return actions.find((action) => canTransition(status.value, action)) ?? null
  })

  const lanes = computed<readonly LaneState[]>(() => {
    const sim = simulation.value
    if (sim) {
      return sim.runners.map((runner) => ({
        lane: runner.lane,
        horseId: runner.horseId,
        progress: distanceCovered(runner, sim.segmentLength, elapsed.value) / sim.distance,
        finished: elapsed.value >= runner.finishTime,
      }))
    }
    // Before the start the next field waits at the gate.
    return (currentRound.value?.lanes ?? []).map((horseId, index) => ({
      lane: index + 1,
      horseId,
      progress: 0,
      finished: false,
    }))
  })

  // Actions
  function configure(options: { seed: number; rules?: RaceRules; timing?: RaceTiming }): void {
    seed.value = options.seed
    if (options.rules) rules.value = options.rules
    if (options.timing) timing.value = options.timing
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

    if (elapsed.value >= sim.duration && results.value.length === sim.roundIndex) {
      results.value = [...results.value, rankRunners(sim)]
    }

    const intermission = timing.value.intermissionSeconds * timing.value.playbackRate
    if (elapsed.value >= sim.duration + intermission) {
      const next = sim.roundIndex + 1
      if (next < schedule.value.length) {
        beginRound(next)
      } else {
        status.value = transition(status.value, 'complete')
      }
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

  return {
    // state
    seed,
    status,
    programNumber,
    schedule,
    currentRoundIndex,
    simulation,
    elapsed,
    results,
    // getters
    currentRound,
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
