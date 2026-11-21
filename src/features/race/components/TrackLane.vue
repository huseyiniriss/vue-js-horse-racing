<script setup lang="ts">
import { computed } from 'vue'

import { HorseFigure, type Horse } from '@/features/horses'
import { formatOrdinal } from '@/shared/lib/format'

import { RACE_COPY } from '../copy'
import type { LaneState } from '../store/race.store'

const props = defineProps<{
  lane: number
  state: LaneState | null
  horse: Horse | null
  isRunning: boolean
}>()

const isGalloping = computed(() => props.isRunning && props.state !== null && !props.state.finished)
const accessibleName = computed(() =>
  props.horse ? `${RACE_COPY.lane(props.lane)}, ${props.horse.name}` : RACE_COPY.lane(props.lane),
)
</script>

<template>
  <li class="track-lane" :data-testid="`lane-${lane}`" :aria-label="accessibleName">
    <span class="track-lane__gate" aria-hidden="true">{{ lane }}</span>
    <div class="track-lane__course">
      <div
        v-if="state && horse"
        class="track-lane__runner"
        :class="{ 'track-lane__runner--galloping': isGalloping }"
        :style="{ '--progress': state.progress }"
        data-testid="runner"
        :data-progress="state.progress.toFixed(3)"
      >
        <HorseFigure class="track-lane__horse" :color="horse.color.hex" :number="lane" />
        <span
          v-if="state.position !== null"
          class="track-lane__position"
          :class="`track-lane__position--${state.position}`"
        >
          {{ formatOrdinal(state.position) }}
        </span>
      </div>
    </div>
  </li>
</template>

<style scoped>
.track-lane {
  display: grid;
  grid-template-columns: var(--gate-width) 1fr;
  height: var(--lane-height);
  background: var(--color-turf);
}

.track-lane:nth-child(even) {
  background: var(--color-turf-stripe);
}

.track-lane + .track-lane {
  border-top: var(--border-width) dashed var(--color-lane-line);
}

.track-lane__gate {
  display: grid;
  place-items: center;
  border-right: 3px solid var(--color-rail);
  color: var(--color-ink-inverse);
  font-size: var(--font-size-sm);
  font-stretch: var(--font-stretch-condensed);
  font-weight: var(--font-weight-bold);
}

.track-lane__course {
  position: relative;
  container-type: inline-size;
}

.track-lane__runner {
  position: absolute;
  top: 50%;
  left: 0;
  width: var(--runner-size);
  /* The horse's nose touches the finish line at progress 1. */
  transform: translate(calc(var(--progress) * (100cqi - var(--runner-size))), -50%);
  will-change: transform;
}

.track-lane__horse {
  transform-origin: 50% 90%;
}

.track-lane__runner--galloping .track-lane__horse {
  animation: gallop var(--duration-gallop) var(--ease-in-out) infinite;
}

.track-lane__position {
  position: absolute;
  top: 50%;
  right: calc(100% + var(--space-1));
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: var(--font-size-xs);
  font-stretch: var(--font-stretch-condensed);
  font-weight: var(--font-weight-bold);
  transform: translateY(-50%);
  animation: pop-in var(--duration-base) var(--ease-out);
}

.track-lane__position--1 {
  background: var(--color-gold);
  color: var(--color-ink-inverse);
}

.track-lane__position--2 {
  background: var(--color-silver);
  color: var(--color-ink-inverse);
}

.track-lane__position--3 {
  background: var(--color-bronze);
  color: var(--color-ink-inverse);
}

@keyframes gallop {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8%) rotate(-3deg);
  }
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: translateY(-50%) scale(0.6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .track-lane__runner--galloping .track-lane__horse,
  .track-lane__position {
    animation: none;
  }
}
</style>
