import { describe, expect, it } from 'vitest'

import { contrastRatio, pickContrasting, relativeLuminance } from './color'

describe('color', () => {
  it('computes WCAG luminance at the extremes', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1)
  })

  it('computes the contrast ratio, order independent', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21)
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21)
  })

  it('picks the more readable of two colors', () => {
    expect(pickContrasting('#F3C300', '#ffffff', '#17251c')).toBe('#17251c')
    expect(pickContrasting('#2B3D26', '#ffffff', '#17251c')).toBe('#ffffff')
  })

  it('rejects malformed colors', () => {
    expect(() => relativeLuminance('red')).toThrow(RangeError)
  })
})
