/**
 * Race lifecycle as an explicit state machine.
 *
 *   idle ──generate──▶ ready ──start──▶ running ◀──resume── paused
 *                        ▲  │             │  └────pause────▶  │
 *                        │  └─generate─┘  └──complete──▶ finished
 *                        └─────────────generate──────────────┘
 *
 * Moving between rounds is not a status change: a running race day stays
 * "running" from the first round until the last result is in.
 * Generating a new program is only allowed when nothing is in progress, so a
 * click on "Generate" can never wipe a race that is running or paused.
 */

export type RaceStatus = 'idle' | 'ready' | 'running' | 'paused' | 'finished'

export type RaceEvent = 'generate' | 'start' | 'pause' | 'resume' | 'complete'

const TRANSITIONS: Readonly<Record<RaceStatus, Partial<Record<RaceEvent, RaceStatus>>>> = {
  idle: { generate: 'ready' },
  ready: { generate: 'ready', start: 'running' },
  running: { pause: 'paused', complete: 'finished' },
  paused: { resume: 'running' },
  finished: { generate: 'ready' },
}

export function canTransition(status: RaceStatus, event: RaceEvent): boolean {
  return TRANSITIONS[status][event] !== undefined
}

/** Returns the next status, or throws if the event is not allowed in the current one. */
export function transition(status: RaceStatus, event: RaceEvent): RaceStatus {
  const next = TRANSITIONS[status][event]
  if (next === undefined) {
    throw new Error(`Event "${event}" is not allowed while the race is "${status}"`)
  }
  return next
}
