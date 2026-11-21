import type { SilksPattern } from './domain/horse'

// User-facing text of the horses feature.
export const SILKS_PATTERN_LABELS: Readonly<Record<SilksPattern, string>> = {
  hoops: 'hoops',
  stripes: 'stripes',
  chevrons: 'chevrons',
  quartered: 'quartered',
  sash: 'sash',
  star: 'star',
  spots: 'spots',
  halved: 'halved',
  'cross-belts': 'cross belts',
  diamond: 'diamond',
}

export const HORSES_COPY = {
  listTitle: 'Horses',
  listCount: (count: number) => `${count} in the stable`,
  columnName: 'Horse',
  columnCondition: 'Condition',
  conditionLabel: (value: number) => `Condition ${value} out of 100`,
  colorLabel: (color: string, pattern: SilksPattern) =>
    `${color} silks, ${SILKS_PATTERN_LABELS[pattern]}`,
} as const
