import type { HorseColor } from './horse'

/**
 * Kenneth Kelly's colors of maximum contrast (1965), without white and black.
 * Exactly 20 hues chosen to stay distinguishable from each other, which is
 * what "each horse has a unique color" needs on a busy race track.
 */
export const HORSE_PALETTE: readonly HorseColor[] = [
  { name: 'Vivid yellow', hex: '#F3C300' },
  { name: 'Strong purple', hex: '#875692' },
  { name: 'Vivid orange', hex: '#F38400' },
  { name: 'Light blue', hex: '#A1CAF1' },
  { name: 'Vivid red', hex: '#BE0032' },
  { name: 'Buff', hex: '#C2B280' },
  { name: 'Medium gray', hex: '#848482' },
  { name: 'Vivid green', hex: '#008856' },
  { name: 'Purplish pink', hex: '#E68FAC' },
  { name: 'Strong blue', hex: '#0067A5' },
  { name: 'Yellowish pink', hex: '#F99379' },
  { name: 'Violet', hex: '#604E97' },
  { name: 'Orange yellow', hex: '#F6A600' },
  { name: 'Purplish red', hex: '#B3446C' },
  { name: 'Greenish yellow', hex: '#DCD300' },
  { name: 'Reddish brown', hex: '#882D17' },
  { name: 'Yellow green', hex: '#8DB600' },
  { name: 'Yellowish brown', hex: '#654522' },
  { name: 'Reddish orange', hex: '#E25822' },
  { name: 'Olive green', hex: '#2B3D26' },
]
