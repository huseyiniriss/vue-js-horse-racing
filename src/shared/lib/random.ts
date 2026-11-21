/**
 * Deterministic randomness.
 *
 * Every random decision in the game goes through a `RandomSource`, so a single seed
 * reproduces a whole race day (horses, program and results). Tests and the
 * `?seed=` URL parameter rely on this.
 */

/** Returns a float in [0, 1). Same contract as `Math.random`. */
export type RandomSource = () => number

const UINT32_RANGE = 2 ** 32

/** mulberry32: tiny, fast and good enough for gameplay (not for cryptography). */
export function createRandom(seed: number): RandomSource {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE
  }
}

/**
 * Derives an independent seed from a base seed and a label (FNV-1a).
 * Lets each concern (horses, program #2, round #4 …) draw from its own stream,
 * so adding a random call in one place never shifts the numbers of another.
 */
export function deriveSeed(...parts: readonly (string | number)[]): number {
  let hash = 0x811c9dc5
  for (const char of parts.join(':')) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** A fresh seed for a new session. */
export function createSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? Date.now() >>> 0
}

/** Integer in [min, max], both inclusive. */
export function randomInt(random: RandomSource, min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new RangeError(`Invalid integer range [${min}, ${max}]`)
  }
  return min + Math.floor(random() * (max - min + 1))
}

/** Float in [min, max). */
export function randomBetween(random: RandomSource, min: number, max: number): number {
  return min + random() * (max - min)
}

/** Returns a shuffled copy (Fisher–Yates). The input is not mutated. */
export function shuffle<T>(random: RandomSource, items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(random, 0, i)
    ;[result[i], result[j]] = [result[j] as T, result[i] as T]
  }
  return result
}

/** Picks `count` distinct items in random order. */
export function sample<T>(random: RandomSource, items: readonly T[], count: number): T[] {
  if (count > items.length) {
    throw new RangeError(`Cannot sample ${count} items from ${items.length}`)
  }
  return shuffle(random, items).slice(0, count)
}
