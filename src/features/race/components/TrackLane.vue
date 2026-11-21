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
  /** Stall gates open once the round has started. */
  isGateOpen: boolean
}>()

const isGalloping = computed(() => props.isRunning && props.state !== null && !props.state.finished)
const accessibleName = computed(() =>
  props.horse ? `${RACE_COPY.lane(props.lane)}, ${props.horse.name}` : RACE_COPY.lane(props.lane),
)
</script>

<template>
  <li class="track-lane" :data-testid="`lane-${lane}`" :aria-label="accessibleName">
    <span
      class="track-lane__stall"
      :class="{ 'track-lane__stall--open': isGateOpen }"
      aria-hidden="true"
    >
      <span class="track-lane__number">{{ lane }}</span>
      <span class="track-lane__gate" />
    </span>
    <div class="track-lane__course">
      <div
        v-if="state && horse"
        class="track-lane__runner"
        :style="{ '--progress': state.progress }"
        data-testid="runner"
        :data-progress="state.progress.toFixed(3)"
      >
        <HorseFigure
          class="track-lane__horse"
          :jockey="horse.silks.body"
          :galloping="isGalloping"
          :phase="lane"
        />
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
  position: relative;
  display: grid;
  grid-template-columns: var(--gate-width) 1fr;
  height: var(--lane-height);
}

.track-lane + .track-lane {
  border-top: var(--border-width) solid var(--color-lane-line);
}

/* Starting stall: brushed aluminium, a fixed number plate, a gate that drops on the start. */
.track-lane__stall {
  position: relative;
  display: grid;
  place-items: center;
  background: linear-gradient(
    to right,
    var(--color-stall) 0%,
    var(--color-stall-light) 40%,
    var(--color-stall-shade) 100%
  );
  border-right: var(--border-width) solid var(--color-stall-frame);
}

.track-lane__number {
  display: grid;
  place-items: center;
  min-width: 1.375rem;
  height: 1.375rem;
  border-radius: 3px;
  background: var(--color-plate);
  color: var(--color-ink-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
}

.track-lane__gate {
  position: absolute;
  top: 2px;
  bottom: 2px;
  right: -4px;
  width: 7px;
  border-radius: 1px;
  background: repeating-linear-gradient(
    to bottom,
    var(--color-stall-light) 0 3px,
    var(--color-stall-frame) 3px 5px
  );
  transform-origin: top;
  transition: transform var(--duration-gate) var(--ease-out);
}

.track-lane__stall--open .track-lane__gate {
  transform: scaleY(0);
}

.track-lane__course {
  position: relative;
  container-type: inline-size;
}

.track-lane__runner {
  position: absolute;
  bottom: 4%;
  left: var(--start-inset);
  width: var(--runner-width);
  /* The horse's nose touches the finish line at progress 1. */
  transform: translateX(
    calc(
      var(--progress) * (100cqi - var(--runner-width) - var(--start-inset) - var(--finish-inset))
    )
  );
  will-change: transform;
}

/* Shadow on the turf under the horse. */
.track-lane__runner::before {
  content: '';
  position: absolute;
  left: 18%;
  right: 12%;
  bottom: -2px;
  height: 18%;
  border-radius: 50%;
  background: var(--color-horse-shadow);
  filter: blur(2px);
}

.track-lane__horse {
  color: var(--color-horse);
}

.track-lane__position {
  position: absolute;
  top: 50%;
  right: calc(100% + var(--space-2));
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  transform: translateY(-50%);
  animation: pop-in var(--duration-base) var(--ease-out);
}

.track-lane__position--1 {
  background: var(--color-gold);
}

.track-lane__position--2 {
  background: var(--color-silver);
}

.track-lane__position--3 {
  background: var(--color-bronze);
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: translateY(-50%) scale(0.6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .track-lane__position {
    animation: none;
  }
}
</style>
