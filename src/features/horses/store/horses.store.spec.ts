import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { createRandom } from '@/shared/lib/random'

import { useHorsesStore } from './horses.store'

describe('horses store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts empty', () => {
    expect(useHorsesStore().horses).toEqual([])
  })

  it('populates a stable of 20 horses from a random source', () => {
    const store = useHorsesStore()
    store.populate(createRandom(1))
    expect(store.horses).toHaveLength(20)
    expect(store.horseIds).toEqual(store.horses.map((horse) => horse.id))
  })

  it('looks horses up by id and fails loudly on unknown ids', () => {
    const store = useHorsesStore()
    store.populate(createRandom(1))
    const [first] = store.horses
    expect(store.getHorse(first!.id)).toBe(first)
    expect(() => store.getHorse(999)).toThrow('Unknown horse #999')
  })
})
