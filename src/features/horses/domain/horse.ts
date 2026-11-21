export type HorseId = number

export interface HorseColor {
  readonly name: string
  readonly hex: string
}

export interface Horse {
  readonly id: HorseId
  readonly name: string
  readonly color: HorseColor
  /** 1–100. Higher condition means a faster horse on average. */
  readonly condition: number
}
