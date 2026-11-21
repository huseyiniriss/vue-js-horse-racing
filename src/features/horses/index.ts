// Public API of the horses feature. Other features import from here only.
export {
  SILKS_PATTERNS,
  type Horse,
  type HorseColor,
  type HorseId,
  type Silks,
  type SilksPattern,
} from './domain/horse'
export { HORSE_RULES, type HorseRules } from './domain/horse.rules'
export { generateHorses } from './domain/generate-horses'
export { useHorsesStore } from './store/horses.store'
export { default as HorseFigure } from './components/HorseFigure.vue'
export { default as HorseLabel } from './components/HorseLabel.vue'
export { default as HorseList } from './components/HorseList.vue'
export { default as SilksIcon } from './components/SilksIcon.vue'
