export interface PaceModel {
  /** Average speed of a condition-50 horse, in metres per second. */
  readonly baseSpeed: number
  /** Speed bonus at condition 100 (and penalty at condition 0), as a fraction of baseSpeed. */
  readonly conditionWeight: number
  /** Day-to-day form: each horse's speed for a round is scaled by up to ± this fraction. */
  readonly formVariance: number
  /** A round is split into this many equal segments, each with its own pace. */
  readonly segmentCount: number
  /** Per-segment pace change, as a fraction (± this value). Creates overtakes. */
  readonly segmentVariance: number
}

export interface RaceRules {
  /** One entry per round, in order. The number of rounds is derived from it. */
  readonly roundDistances: readonly number[]
  readonly horsesPerRound: number
  readonly pace: PaceModel
}

export const RACE_RULES: RaceRules = {
  roundDistances: [1200, 1400, 1600, 1800, 2000, 2200],
  horsesPerRound: 10,
  pace: {
    baseSpeed: 16,
    conditionWeight: 0.06,
    formVariance: 0.03,
    segmentCount: 8,
    segmentVariance: 0.06,
  },
}
