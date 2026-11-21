import type { Horse } from '@/features/horses'

export interface RoundTableRow {
  readonly key: string | number
  /** Saddle-cloth number (program) or finishing position (results). */
  readonly lead: number
  readonly horse: Horse
  readonly trailing?: string
  /** Podium styling for the first three of a result. */
  readonly podium?: 1 | 2 | 3
}
