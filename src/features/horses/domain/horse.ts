export type HorseId = number

export interface HorseColor {
  readonly name: string
  readonly hex: string
}

/** Classic racing silks designs, as registered by owners. */
export const SILKS_PATTERNS = [
  'hoops',
  'stripes',
  'chevrons',
  'quartered',
  'sash',
  'star',
  'spots',
  'halved',
  'cross-belts',
  'diamond',
] as const

export type SilksPattern = (typeof SILKS_PATTERNS)[number]

/** What the jockey wears: how a horse is recognised on the track. */
export interface Silks {
  readonly pattern: SilksPattern
  /** Main color: the horse's unique color. */
  readonly body: string
  /** Contrasting color for the pattern. */
  readonly trim: string
}

export interface Horse {
  readonly id: HorseId
  readonly name: string
  readonly color: HorseColor
  readonly silks: Silks
  /** 1–100. Higher condition means a faster horse on average. */
  readonly condition: number
}
