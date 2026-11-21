import type { Pinia } from 'pinia'

import { useHorsesStore } from '@/features/horses'
import { useRaceStore } from '@/features/race'
import { createRandom, createSeed, deriveSeed } from '@/shared/lib/random'

const SEED_PARAM = 'seed'

/** Reads `?seed=<uint32>` from the URL, or creates a fresh seed. */
export function resolveSeed(search: string, fallback: () => number = createSeed): number {
  const raw = new URLSearchParams(search).get(SEED_PARAM)
  if (raw === null || !/^\d+$/.test(raw)) return fallback()
  const seed = Number(raw)
  return Number.isSafeInteger(seed) && seed <= 0xffffffff ? seed : fallback()
}

export function replayUrl(seed: number, location: Pick<Location, 'origin' | 'pathname'>): string {
  const url = new URL(location.pathname, location.origin)
  url.searchParams.set(SEED_PARAM, String(seed))
  return url.toString()
}

/** Creates the session: one seed drives the stable and every program that follows. */
export function bootstrapGame(pinia: Pinia, seed: number): void {
  useHorsesStore(pinia).populate(createRandom(deriveSeed(seed, 'horses')))
  useRaceStore(pinia).configure({ seed })
}
