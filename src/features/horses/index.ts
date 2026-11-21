// Public API of the horses feature: only what other features and the app shell use.
export type { Horse, HorseId } from './domain/horse'
export { useHorsesStore } from './store/horses.store'
export { default as HorseFigure } from './components/HorseFigure.vue'
export { default as HorseLabel } from './components/HorseLabel.vue'
export { default as HorseList } from './components/HorseList.vue'
