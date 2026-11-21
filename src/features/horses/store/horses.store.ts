import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

import type { RandomSource } from '@/shared/lib/random'

import { generateHorses } from '../domain/generate-horses'
import type { Horse, HorseId } from '../domain/horse'

export const useHorsesStore = defineStore('horses', () => {
  // Horses never change after creation, so the list is replaced, never mutated.
  const horses = shallowRef<readonly Horse[]>([])

  const horsesById = computed(() => new Map(horses.value.map((horse) => [horse.id, horse])))
  const horseIds = computed(() => horses.value.map((horse) => horse.id))

  function populate(random: RandomSource): void {
    horses.value = generateHorses(random)
  }

  function getHorse(id: HorseId): Horse {
    const horse = horsesById.value.get(id)
    if (!horse) throw new Error(`Unknown horse #${id}`)
    return horse
  }

  return { horses, horseIds, populate, getHorse }
})
