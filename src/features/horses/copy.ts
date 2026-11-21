// User-facing text of the horses feature.
export const HORSES_COPY = {
  listTitle: 'Horses',
  listCount: (count: number) => `${count} in the stable`,
  columnName: 'Name',
  columnCondition: 'Condition',
  columnColor: 'Color',
  conditionLabel: (value: number) => `Condition ${value} out of 100`,
} as const
