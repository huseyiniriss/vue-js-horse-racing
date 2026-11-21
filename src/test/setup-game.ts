import { createPinia, setActivePinia, type Pinia } from 'pinia'

import { useHorsesStore } from '@/features/horses'
import { useRaceStore } from '@/features/race'
import { createRandom } from '@/shared/lib/random'

/** A fresh, seeded game for component tests. */
export function setupGame(seed = 42): Pinia {
  const pinia = createPinia()
  setActivePinia(pinia)
  useHorsesStore().populate(createRandom(seed))
  useRaceStore().configure({ seed })
  return pinia
}
