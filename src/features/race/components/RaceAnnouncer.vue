<script setup lang="ts">
import { ref, watch } from 'vue'

import { useHorsesStore } from '@/features/horses'

import { RACE_COPY } from '../copy'
import { useRaceStore } from '../store/race.store'

/** Narrates the race for screen reader users; visually hidden. */
const race = useRaceStore()
const horses = useHorsesStore()
const message = ref('')

// Announce a round when it starts: on Start, and on every round change while running.
// Resuming after a pause is not a new start.
watch(
  () => [race.status, race.currentRoundIndex] as const,
  ([status, roundIndex], [previousStatus, previousRoundIndex]) => {
    const round = race.currentRound
    if (status !== 'running' || !round) return
    if (previousStatus === 'ready' || roundIndex !== previousRoundIndex) {
      message.value = RACE_COPY.announceRoundStart(round.index + 1, round.distance)
    }
  },
)

watch(
  () => race.results.length,
  (count, previous) => {
    const result = race.results[count - 1]
    const winner = result?.placings[0]
    if (!result || !winner || count <= previous) return
    const parts = [RACE_COPY.announceWinner(count, horses.getHorse(winner.horseId).name)]
    if (count === race.roundCount) parts.push(RACE_COPY.announceDayComplete)
    message.value = parts.join(' ')
  },
)
</script>

<template>
  <p class="visually-hidden" role="status" aria-live="polite" data-testid="announcer">
    {{ message }}
  </p>
</template>
