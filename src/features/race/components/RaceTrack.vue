<script setup lang="ts">
import { computed } from 'vue'

import { useHorsesStore } from '@/features/horses'

import { RACE_COPY } from '../copy'
import { useRaceStore } from '../store/race.store'
import TrackLane from './TrackLane.vue'

const MARKER_INTERVAL_METRES = 200

const race = useRaceStore()
const horses = useHorsesStore()

const isRunning = computed(() => race.status === 'running')

/** Always draw the full field, so the track keeps its shape before a program exists. */
const laneRows = computed(() =>
  Array.from({ length: race.laneCount }, (_, index) => {
    const state = race.lanes[index] ?? null
    return {
      lane: index + 1,
      state,
      horse: state ? horses.getHorse(state.horseId) : null,
    }
  }),
)

/** Distance poles every 200 m, positioned in the same coordinate space as the horses' noses. */
const markers = computed(() => {
  const distance = race.currentRound?.distance
  if (!distance) return []
  const count = Math.floor((distance - 1) / MARKER_INTERVAL_METRES)
  return Array.from({ length: count }, (_, index) => {
    const metres = (index + 1) * MARKER_INTERVAL_METRES
    return { metres, fraction: metres / distance }
  })
})
</script>

<template>
  <section class="race-track" :aria-label="RACE_COPY.trackTitle">
    <header class="race-track__header">
      <div v-if="race.currentRound" class="race-track__round">
        <h2 class="race-track__title" data-testid="round-title">
          {{ RACE_COPY.roundOf(race.currentRound.index + 1, race.roundCount) }}
        </h2>
        <span class="race-track__distance">
          {{ RACE_COPY.distance(race.currentRound.distance) }}
        </span>
      </div>
      <h2 v-else class="race-track__title">{{ RACE_COPY.trackTitle }}</h2>
      <span
        class="race-track__status"
        :class="`race-track__status--${race.status}`"
        data-testid="race-status"
      >
        {{ RACE_COPY.statusLabel[race.status] }}
      </span>
    </header>

    <div class="race-track__field">
      <ol class="race-track__lanes">
        <TrackLane
          v-for="row in laneRows"
          :key="row.lane"
          :lane="row.lane"
          :state="row.state"
          :horse="row.horse"
          :is-running="isRunning"
        />
      </ol>

      <div class="race-track__overlay" aria-hidden="true">
        <span
          v-for="marker in markers"
          :key="marker.metres"
          class="race-track__marker"
          :style="{ '--fraction': marker.fraction }"
        >
          <span class="race-track__marker-label">{{ marker.metres }}</span>
        </span>
        <span class="race-track__finish">
          <span class="race-track__marker-label">{{ RACE_COPY.finish }}</span>
        </span>
      </div>

      <p v-if="race.status === 'idle'" class="race-track__empty">{{ RACE_COPY.trackIdle }}</p>
    </div>
  </section>
</template>

<style scoped>
.race-track {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.race-track__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--border-width) solid var(--color-line);
}

.race-track__round {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.race-track__title {
  font-size: var(--font-size-xl);
  font-stretch: var(--font-stretch-condensed);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.race-track__distance {
  color: var(--color-ink-muted);
  font-size: var(--font-size-lg);
  font-stretch: var(--font-stretch-condensed);
}

.race-track__status {
  flex: none;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--color-surface-sunken);
  color: var(--color-ink-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.race-track__status--running {
  background: var(--color-action);
  color: var(--color-ink-inverse);
}

.race-track__status--paused {
  background: var(--color-highlight);
  color: var(--color-ink);
}

.race-track__field {
  position: relative;
  padding-top: var(--space-5);
  background: var(--color-turf);
  border-bottom: 4px solid var(--color-rail);
}

.race-track__lanes {
  border-top: 4px solid var(--color-rail);
}

/* Covers the courses only (not the gates), in the horses' nose coordinate space. */
.race-track__overlay {
  position: absolute;
  inset: 0 0 0 var(--gate-width);
  pointer-events: none;
}

.race-track__marker,
.race-track__finish {
  position: absolute;
  top: 0;
  bottom: 0;
}

.race-track__marker {
  left: calc(var(--runner-size) + (100% - var(--runner-size)) * var(--fraction));
  border-left: var(--border-width) dashed var(--color-marker);
}

.race-track__finish {
  right: 0;
  width: 0.5rem;
  background: repeating-conic-gradient(var(--color-rail) 0 25%, var(--color-ink) 0 50%) 0 0 / 0.5rem
    0.5rem;
}

.race-track__marker-label {
  position: absolute;
  top: var(--space-1);
  left: 0;
  color: var(--color-ink-inverse);
  font-size: var(--font-size-xs);
  font-stretch: var(--font-stretch-condensed);
  line-height: 1;
  transform: translateX(-50%);
}

.race-track__finish .race-track__marker-label {
  left: auto;
  right: 0;
  transform: none;
  font-weight: var(--font-weight-bold);
}

.race-track__empty {
  position: absolute;
  inset: var(--space-5) 0 0 var(--gate-width);
  display: grid;
  place-items: center;
  padding: var(--space-4);
  color: var(--color-ink-inverse);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  text-align: center;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.35);
}
</style>
