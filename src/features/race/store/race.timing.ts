/** How race time maps to wall-clock time on screen. Gameplay rules live in race.rules.ts. */
export interface RaceTiming {
  /** Race seconds shown per real second. 8 turns a 75 s, 1200 m race into ~9 s. */
  readonly playbackRate: number
  /** Real seconds the finished field stays on screen before the next round starts. */
  readonly intermissionSeconds: number
}

export const RACE_TIMING: RaceTiming = {
  playbackRate: 8,
  intermissionSeconds: 1.5,
}
