<script setup lang="ts">
import { computed } from 'vue'

import { useHorsesStore } from '@/features/horses'
import { useScrollIntoView } from '@/shared/composables/useScrollIntoView'
import PanelSection from '@/shared/ui/PanelSection.vue'

import { RACE_COPY } from '../copy'
import { useRaceStore } from '../store/race.store'
import type { RoundTableRow } from './round-table'
import RoundTable from './RoundTable.vue'

const race = useRaceStore()
const horses = useHorsesStore()

const rounds = computed(() =>
  race.schedule.map((round) => ({
    index: round.index,
    title: RACE_COPY.roundTitle(round.index + 1),
    subtitle: RACE_COPY.distance(round.distance),
    rows: round.lanes.map((horseId, laneIndex): RoundTableRow => ({
      key: horseId,
      lead: laneIndex + 1,
      horse: horses.getHorse(horseId),
    })),
  })),
)

const highlightedRound = computed(() =>
  race.status === 'idle' || race.status === 'finished' ? null : race.currentRoundIndex,
)

const { setItemRef } = useScrollIntoView(highlightedRound)
</script>

<template>
  <PanelSection :title="RACE_COPY.programTitle">
    <p v-if="rounds.length === 0" class="program-panel__empty">{{ RACE_COPY.programEmpty }}</p>
    <ol v-else class="program-panel__rounds" data-testid="program">
      <li
        v-for="round in rounds"
        :key="round.index"
        :ref="(el) => setItemRef(round.index, el)"
        :aria-current="round.index === highlightedRound ? 'step' : undefined"
        data-testid="program-round"
      >
        <RoundTable
          :title="round.title"
          :subtitle="round.subtitle"
          lead-kind="cloth"
          :lead-label="RACE_COPY.columnLane"
          :horse-label="RACE_COPY.columnHorse"
          :rows="round.rows"
          :is-current="round.index === highlightedRound"
        />
      </li>
    </ol>
  </PanelSection>
</template>

<style scoped>
.program-panel__empty {
  padding: var(--space-4);
  color: var(--color-ink-muted);
  font-size: var(--font-size-sm);
}
</style>
