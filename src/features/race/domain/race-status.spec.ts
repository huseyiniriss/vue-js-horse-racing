import { describe, expect, it } from 'vitest'

import { canTransition, transition, type RaceEvent, type RaceStatus } from './race-status'

const ALL_STATUSES: RaceStatus[] = ['idle', 'ready', 'running', 'paused', 'finished']
const ALL_EVENTS: RaceEvent[] = ['generate', 'start', 'pause', 'resume', 'complete']

// The full status × event matrix. Anything not listed must be rejected.
const ALLOWED: Record<string, RaceStatus> = {
  'idle/generate': 'ready',
  'ready/generate': 'ready',
  'ready/start': 'running',
  'running/pause': 'paused',
  'running/complete': 'finished',
  'paused/resume': 'running',
  'finished/generate': 'ready',
}

describe('race status machine', () => {
  for (const status of ALL_STATUSES) {
    for (const event of ALL_EVENTS) {
      const expected = ALLOWED[`${status}/${event}`]

      if (expected) {
        it(`${status} --${event}--> ${expected}`, () => {
          expect(canTransition(status, event)).toBe(true)
          expect(transition(status, event)).toBe(expected)
        })
      } else {
        it(`${status} rejects ${event}`, () => {
          expect(canTransition(status, event)).toBe(false)
          expect(() => transition(status, event)).toThrow(`"${event}" is not allowed`)
        })
      }
    }
  }

  it('never lets "generate" interrupt a race in progress', () => {
    expect(canTransition('running', 'generate')).toBe(false)
    expect(canTransition('paused', 'generate')).toBe(false)
  })
})
