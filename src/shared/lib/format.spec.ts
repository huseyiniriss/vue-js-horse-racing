import { describe, expect, it } from 'vitest'

import { formatDistance, formatGap, formatOrdinal, formatRaceTime } from './format'

describe('format', () => {
  it('formats distances in metres', () => {
    expect(formatDistance(1200)).toBe('1,200 m')
  })

  it.each([
    [74.318, '1:14.32'],
    [59.999, '1:00.00'],
    [9.5, '0:09.50'],
    [137.2, '2:17.20'],
  ])('formats race time %f as %s', (seconds, expected) => {
    expect(formatRaceTime(seconds)).toBe(expected)
  })

  it.each([
    [1, '1st'],
    [2, '2nd'],
    [3, '3rd'],
    [4, '4th'],
    [11, '11th'],
    [21, '21st'],
  ])('formats ordinal %i as %s', (value, expected) => {
    expect(formatOrdinal(value)).toBe(expected)
  })
  it('formats the gap behind the winner', () => {
    expect(formatGap(0.294)).toBe('+0.29')
    expect(formatGap(3)).toBe('+3.00')
  })
})
