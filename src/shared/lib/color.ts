/** WCAG relative luminance of a #rrggbb color. */
export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!match) throw new RangeError(`Expected a #rrggbb color, got "${hex}"`)

  const [r, g, b] = match.slice(1).map((channel) => {
    const value = parseInt(channel, 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ]
  return (light + 0.05) / (dark + 0.05)
}

/** Picks whichever of two colors contrasts more with the background. */
export function pickContrasting(background: string, light: string, dark: string): string {
  return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark
}
