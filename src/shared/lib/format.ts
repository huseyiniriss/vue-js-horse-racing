const distanceFormat = new Intl.NumberFormat('en', { style: 'unit', unit: 'meter' })

/** 1200 → "1,200 m" */
export function formatDistance(metres: number): string {
  return distanceFormat.format(metres)
}

/** 74.318 → "1:14.32" (race clock: minutes, seconds, hundredths) */
export function formatRaceTime(seconds: number): string {
  const totalHundredths = Math.round(seconds * 100)
  const minutes = Math.floor(totalHundredths / 6000)
  const rest = (totalHundredths % 6000) / 100
  return `${minutes}:${rest.toFixed(2).padStart(5, '0')}`
}

/** 1 → "1st", 2 → "2nd", 11 → "11th" */
export function formatOrdinal(value: number): string {
  const suffixes: Record<string, string> = { one: 'st', two: 'nd', few: 'rd', other: 'th' }
  return `${value}${suffixes[ordinalRules.select(value)] ?? 'th'}`
}

const ordinalRules = new Intl.PluralRules('en', { type: 'ordinal' })

/** Seconds to hundredths: 0.294 → "0.29" */
export function formatSeconds(seconds: number): string {
  return seconds.toFixed(2)
}

/** Gap behind the winner, racecard style: 0.294 → "+0.29" */
export function formatGap(seconds: number): string {
  return `+${formatSeconds(seconds)}`
}
