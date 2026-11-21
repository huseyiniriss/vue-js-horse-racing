// Public API of the horses feature. Other features import from here only.
export type { Horse, HorseColor, HorseId } from './domain/horse'
export { HORSE_RULES, type HorseRules } from './domain/horse.rules'
export { generateHorses } from './domain/generate-horses'
export { useHorsesStore } from './store/horses.store'
