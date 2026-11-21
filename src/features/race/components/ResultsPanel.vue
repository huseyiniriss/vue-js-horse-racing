<script setup lang="ts">
import { computed } from 'vue'

import { useHorsesStore } from '@/features/horses'
import { useScrollIntoView } from '@/shared/composables/useScrollIntoView'
import { formatGap, formatRaceTime } from '@/shared/lib/format'
import PanelSection from '@/shared/ui/PanelSection.vue'

import { RACE_COPY } from '../copy'
import { useRaceStore } from '../store/race.store'
import type { RoundTableRow } from './round-table'
import RoundTable from './RoundTable.vue'

const race = useRaceStore()
const horses = useHorsesStore()

const results = computed(() =>
  race.results.map((result) => {
    const winnerTime = result.placings[0]?.finishTime ?? 0
    return {
      index: result.roundIndex,
      title: RACE_COPY.roundTitle(result.roundIndex + 1),
      subtitle: RACE_COPY.distance(result.distance),
      // Racecard style: the winner's time, then the gap for everyone behind.
      rows: result.placings.map((placing): RoundTableRow => ({
        key: placing.horseId,
        lead: placing.position,
        horse: horses.getHorse(placing.horseId),
        trailing:
          placing.position === 1
            ? formatRaceTime(placing.finishTime)
            : formatGap(placing.finishTime - winnerTime),
        podium: placing.position <= 3 ? (placing.position as 1 | 2 | 3) : undefined,
      })),
    }
  }),
)

const latestResult = computed(() => results.value.at(-1)?.index ?? null)
const { setItemRef } = useScrollIntoView(latestResult)
</script>

<template>
  <PanelSection :title="RACE_COPY.resultsTitle">
    <template v-if="race.schedule.length > 0" #meta>
      <span class="results-panel__count">
        {{ RACE_COPY.roundsDone(race.results.length, race.roundCount) }}
      </span>
    </template>

    <p v-if="results.length === 0" class="results-panel__empty">{{ RACE_COPY.resultsEmpty }}</p>
    <TransitionGroup v-else tag="ol" name="result" data-testid="results">
      <li
        v-for="result in results"
        :key="result.index"
        :ref="(el) => setItemRef(result.index, el)"
        data-testid="result-round"
      >
        <RoundTable
          :title="result.title"
          :subtitle="result.subtitle"
          lead-kind="position"
          :lead-label="RACE_COPY.columnPosition"
          :horse-label="RACE_COPY.columnHorse"
          :trailing-label="RACE_COPY.columnTime"
          :rows="result.rows"
        />
      </li>
    </TransitionGroup>
  </PanelSection>
</template>

<style scoped>
.results-panel__empty {
  padding: var(--space-4);
  color: var(--color-ink-muted);
  font-size: var(--font-size-sm);
}

.results-panel__count {
  color: var(--color-ink-muted);
  font-size: var(--font-size-xs);
}

.result-enter-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

.result-enter-from {
  opacity: 0;
  transform: translateY(var(--space-2));
}
</style>
