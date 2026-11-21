import type { Pinia } from 'pinia'

import { useHorsesStore } from '@/features/horses'
import { useRaceStore } from '@/features/race'
import { createRandom, createSeed, deriveSeed } from '@/shared/lib/random'

const SEED_PARAM = 'seed'
const PROGRAM_PARAM = 'program'
const MAX_UINT32 = 0xffffffff

export interface Session {
  readonly seed: number
  /** Program the first Generate draws, so a link can replay any program of the day. */
  readonly firstProgram: number
}

function readPositiveInteger(raw: string | null, max: number): number | null {
  if (raw === null || !/^\d+$/.test(raw)) return null
  const value = Number(raw)
  return Number.isSafeInteger(value) && value <= max ? value : null
}

/** Reads `?seed=<uint32>&program=<n>` from the URL; anything invalid falls back to defaults. */
export function resolveSession(search: string, newSeed: () => number = createSeed): Session {
  const params = new URLSearchParams(search)
  const seed = readPositiveInteger(params.get(SEED_PARAM), MAX_UINT32)
  const program = readPositiveInteger(params.get(PROGRAM_PARAM), Number.MAX_SAFE_INTEGER)
  return {
    seed: seed ?? newSeed(),
    // A program number only makes sense with the seed it belongs to.
    firstProgram: seed !== null && program !== null && program > 0 ? program : 1,
  }
}

/** A link that replays the program on screen: same seed, same program number. */
export function replayUrl(
  session: { seed: number; program: number },
  location: Pick<Location, 'origin' | 'pathname'>,
): string {
  const url = new URL(location.pathname, location.origin)
  url.searchParams.set(SEED_PARAM, String(session.seed))
  if (session.program > 1) url.searchParams.set(PROGRAM_PARAM, String(session.program))
  return url.toString()
}

/**
 * Writes a freshly generated seed into the address bar (without a navigation), so a
 * reload keeps the same stable instead of drawing a new one.
 */
export function keepSeedInUrl(
  session: Session,
  location: Pick<Location, 'origin' | 'pathname' | 'search'>,
  history: Pick<History, 'replaceState'>,
): void {
  if (new URLSearchParams(location.search).has(SEED_PARAM)) return
  history.replaceState(null, '', replayUrl({ seed: session.seed, program: 1 }, location))
}

/** Creates the session: one seed drives the stable and every program that follows. */
export function bootstrapGame(pinia: Pinia, session: Session): void {
  useHorsesStore(pinia).populate(createRandom(deriveSeed(session.seed, 'horses')))
  useRaceStore(pinia).configure({ seed: session.seed, firstProgram: session.firstProgram })
}
