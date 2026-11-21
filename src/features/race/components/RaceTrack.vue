<script setup lang="ts">
import { computed } from 'vue'

import { useHorsesStore } from '@/features/horses'

import { RACE_COPY } from '../copy'
import { useRaceStore } from '../store/race.store'
import PhotoFinish from './PhotoFinish.vue'
import TrackLane from './TrackLane.vue'

/** Distance signs along the rail, as on a real course. */
const SIGN_INTERVAL_METRES = 400
/** Signs this close to the winning post would collide with its label. */
const MIN_GAP_TO_FINISH = 0.22

const race = useRaceStore()
const horses = useHorsesStore()

const isRunning = computed(() => race.status === 'running')
const isGateOpen = computed(() => race.elapsed > 0)

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

/** Distance signs on the rail, in the same coordinate space as the horses' noses. */
const signs = computed(() => {
  const distance = race.currentRound?.distance
  if (!distance) return []
  const count = Math.floor(distance / SIGN_INTERVAL_METRES)
  return Array.from({ length: count }, (_, index) => {
    const metres = (index + 1) * SIGN_INTERVAL_METRES
    return { metres, fraction: metres / distance, label: RACE_COPY.distance(metres) }
  }).filter((sign) => 1 - sign.fraction >= MIN_GAP_TO_FINISH)
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
      <div class="race-track__rail" aria-hidden="true">
        <span
          v-for="sign in signs"
          :key="sign.metres"
          class="race-track__sign"
          :style="{ '--fraction': sign.fraction }"
        >
          {{ sign.label }}
        </span>
        <span class="race-track__winning-post">
          <span class="race-track__winning-label">{{ RACE_COPY.finish }}</span>
        </span>
      </div>

      <ol class="race-track__lanes">
        <TrackLane
          v-for="row in laneRows"
          :key="row.lane"
          :lane="row.lane"
          :state="row.state"
          :horse="row.horse"
          :is-running="isRunning"
          :is-gate-open="isGateOpen"
        />
      </ol>

      <span class="race-track__finish-line" aria-hidden="true" />
      <p v-if="race.status === 'idle'" class="race-track__empty">{{ RACE_COPY.trackIdle }}</p>
    </div>

    <PhotoFinish />
  </section>
</template>

<style scoped>
.race-track {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-line);
  border-top: 3px solid var(--color-ink);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.race-track__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}

.race-track__round {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.race-track__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-display);
  line-height: var(--line-height-tight);
}

.race-track__distance {
  color: var(--color-ink-muted);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.race-track__status {
  flex: none;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--color-surface-sunken);
  color: var(--color-ink-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
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
  --rail-height: 2.125rem;

  position: relative;
  /* Mowing bands run across the course, like on a real turf track. */
  background:
    var(--turf-grain),
    repeating-linear-gradient(
      to right,
      var(--color-turf) 0 4.5rem,
      var(--color-turf-stripe) 4.5rem 9rem
    );
  border-bottom: 3px solid var(--color-rail);
}

/* Broadcast-style rail band: a dark strip with the white running rail beneath it. */
.race-track__rail {
  position: relative;
  height: var(--rail-height);
  margin-left: var(--gate-width);
  background: linear-gradient(to bottom, var(--color-rail-band), var(--color-turf));
  border-bottom: 3px solid var(--color-rail);
  container-type: inline-size;
}

.race-track__sign {
  position: absolute;
  bottom: var(--space-2);
  left: calc(var(--runner-width) + (100% - var(--runner-width)) * var(--fraction));
  color: var(--color-ink-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  white-space: nowrap;
  opacity: 0.9;
  transform: translateX(-50%);
}

/* A short white marker post under each sign, standing on the rail. */
.race-track__sign::after {
  content: '';
  position: absolute;
  top: calc(100% + 2px);
  left: 50%;
  width: 2px;
  height: calc(var(--space-2) - 2px);
  background: var(--color-rail);
  transform: translateX(-50%);
}

.race-track__winning-post {
  position: absolute;
  bottom: -3px;
  right: 0;
  width: 4px;
  height: calc(var(--rail-height) - var(--space-1));
  background: var(--color-rail);
}

/* The red disc on top of the winning post, kept inside the track's edge. */
.race-track__winning-post::before {
  content: '';
  position: absolute;
  top: -2px;
  right: 0;
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid var(--color-rail);
  border-radius: 50%;
  background: var(--color-pole);
}

.race-track__winning-label {
  position: absolute;
  top: 1px;
  right: calc(100% + var(--space-4));
  color: var(--color-ink-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  white-space: nowrap;
}

@container (max-width: 24rem) {
  .race-track__sign:nth-of-type(even) {
    display: none;
  }
}

/* Lanes are told apart by a faint line; the mowing bands carry the texture. */
.race-track__lanes {
  position: relative;
}

/* The finish line across all lanes, under the winning post. */
.race-track__finish-line {
  position: absolute;
  top: var(--rail-height);
  bottom: 0;
  right: 0;
  width: 4px;
  background: var(--color-rail);
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.12);
  pointer-events: none;
}

.race-track__empty {
  position: absolute;
  inset: var(--rail-height) 0 0 var(--gate-width);
  display: grid;
  place-items: center;
  padding: var(--space-4);
  color: var(--color-ink-inverse);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.35);
}
</style>
