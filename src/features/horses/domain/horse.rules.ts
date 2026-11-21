export interface HorseRules {
  readonly count: number
  readonly condition: { readonly min: number; readonly max: number }
}

export const HORSE_RULES: HorseRules = {
  count: 20,
  condition: { min: 1, max: 100 },
}
