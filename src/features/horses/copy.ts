// User-facing text of the horses feature.
export const HORSES_COPY = {
  listTitle: 'Horses',
  listCount: (count: number) => `${count} in the stable`,
  columnName: 'Horse',
  columnCondition: 'Condition',
  conditionLabel: (value: number) => `Condition ${value} out of 100`,
  colorLabel: (color: string, pattern: string) => `${color} silks, ${pattern.replace('-', ' ')}`,
} as const
