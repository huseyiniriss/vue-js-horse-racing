<script setup lang="ts">
import { computed } from 'vue'

import { HorseFigure, useHorsesStore } from '@/features/horses'

import { formatSeconds } from '@/shared/lib/format'

import { RACE_COPY } from '../copy'
import { useRaceStore } from '../store/race.store'

/** Candidate tick steps for the time scale; the smallest that keeps it readable wins. */
const TICK_STEPS = [0.5, 1, 2, 5, 10]
const MAX_TICKS = 6
/** Share of the print width the field may spread over (the rest is breathing room). */
const SPREAD = 0.86
/** The stride frame frozen by the camera: legs fully extended. */
const PHOTO_FRAME = 6

const race = useRaceStore()
const horses = useHorsesStore()

/**
 * The finish-line camera's print of the latest round: each horse placed by how far
 * it finished behind the winner, built from the same finish times as the result.
 */
const print = computed(() => {
  const result = race.results.at(-1)
  const winner = result?.placings[0]
  if (!result || !winner) return null

  const gaps = result.placings.map((placing) => placing.finishTime - winner.finishTime)
  const maxGap = Math.max(...gaps)
  const step =
    TICK_STEPS.find((candidate) => maxGap / candidate <= MAX_TICKS - 1) ?? TICK_STEPS.at(-1) ?? 1
  const scaleSeconds = Math.max(step, Math.ceil(maxGap / step) * step)
  const laneOf = new Map(
    race.schedule[result.roundIndex]?.lanes.map((horseId, index) => [horseId, index + 1]) ?? [],
  )

  return {
    key: result.roundIndex,
    title: RACE_COPY.photoTitle(result.roundIndex + 1),
    verdict: RACE_COPY.photoVerdict(
      horses.getHorse(winner.horseId).name,
      formatSeconds(gaps[1] ?? 0),
    ),
    runners: result.placings.map((placing, index) => ({
      horse: horses.getHorse(placing.horseId),
      lane: laneOf.get(placing.horseId) ?? placing.position,
      offset: ((gaps[index] ?? 0) / scaleSeconds) * SPREAD,
    })),
    ticks: Array.from({ length: Math.round(scaleSeconds / step) + 1 }, (_, index) => ({
      label: index === 0 ? RACE_COPY.photoWinnerTick : RACE_COPY.photoGapTick(index * step),
      offset: ((index * step) / scaleSeconds) * SPREAD,
    })),
  }
})
</script>

<template>
  <figure v-if="!print" class="photo-finish photo-finish--empty">
    <figcaption class="photo-finish__caption">
      <span class="photo-finish__title">{{ RACE_COPY.photoEmptyTitle }}</span>
    </figcaption>
    <div class="photo-finish__print photo-finish__print--empty">
      <p class="photo-finish__hint">{{ RACE_COPY.photoEmpty }}</p>
    </div>
  </figure>
  <figure v-else :key="print.key" class="photo-finish" data-testid="photo-finish">
    <figcaption class="photo-finish__caption">
      <span class="photo-finish__title">{{ print.title }}</span>
      <span class="photo-finish__verdict" data-testid="photo-verdict">{{ print.verdict }}</span>
    </figcaption>

    <div class="photo-finish__print" :style="{ '--lanes': race.laneCount }" aria-hidden="true">
      <span class="photo-finish__line" />
      <div
        v-for="runner in print.runners"
        :key="runner.horse.id"
        class="photo-finish__runner"
        :style="{ '--offset': runner.offset, '--lane': runner.lane }"
      >
        <HorseFigure
          class="photo-finish__horse"
          :jockey="runner.horse.silks.body"
          :frame="PHOTO_FRAME"
        />
      </div>
      <div class="photo-finish__scale">
        <span
          v-for="(tick, index) in print.ticks"
          :key="tick.label"
          class="photo-finish__tick"
          :class="{ 'photo-finish__tick--winner': index === 0 }"
          :style="{ '--offset': tick.offset }"
        >
          {{ tick.label }}
        </span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.photo-finish {
  margin: 0;
  padding: var(--space-3) var(--space-4) var(--space-4);
  border-top: var(--border-width) solid var(--color-line);
}

.photo-finish__caption {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-1) var(--space-3);
  margin-bottom: var(--space-2);
}

.photo-finish__title {
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
}

.photo-finish__verdict {
  color: var(--color-ink-muted);
  font-size: var(--font-size-sm);
}

/*
 * The print: monochrome paper like a finish-line camera strip, where silks are the
 * only color. Horses are placed from the finish line (right) by their time gap.
 */
.photo-finish__print {
  --print-height: 6.5rem;
  --horse-width: 3.75rem;
  --finish-line-width: 2px;
  --grid-step: 2.5rem;
  /* Muybridge frames are 282 × 182: height follows from width. */
  --horse-height: calc(var(--horse-width) * 0.646);

  position: relative;
  height: calc(var(--print-height) + var(--space-5));
  overflow: hidden;
  border-radius: var(--radius-sm);
  background:
    repeating-linear-gradient(
      to right,
      transparent 0 calc(var(--grid-step) - var(--border-width)),
      var(--color-photo-rule) calc(var(--grid-step) - var(--border-width)) var(--grid-step)
    ),
    var(--color-photo-paper);
  color: var(--color-photo-ink);
  animation: develop var(--duration-develop) var(--ease-out);
}

.photo-finish__line {
  position: absolute;
  top: 0;
  bottom: var(--space-5);
  right: var(--space-4);
  width: var(--finish-line-width);
  background: var(--color-pole);
}

.photo-finish__runner {
  position: absolute;
  /* Nose on the line for the winner; further left the longer the gap. */
  right: calc(var(--space-4) + (100% - var(--space-4) * 2 - var(--horse-width)) * var(--offset));
  top: calc(
    (var(--print-height) - var(--horse-width) * 0.7) * (var(--lane) - 1) / (var(--lanes) - 1)
  );
  width: var(--horse-width);
  z-index: var(--lane);
}

.photo-finish__horse {
  color: var(--color-photo-ink);
}

.photo-finish__scale {
  position: absolute;
  inset: auto 0 0;
  height: var(--space-5);
  border-top: var(--border-width) solid var(--color-photo-rule);
}

.photo-finish__tick {
  position: absolute;
  bottom: var(--space-1);
  right: calc(var(--space-4) + (100% - var(--space-4) * 2 - var(--horse-width)) * var(--offset));
  color: var(--color-photo-ink);
  font-size: var(--font-size-xs);
  transform: translateX(50%);
}

.photo-finish__tick--winner {
  transform: none;
}

/* Before the first result: same footprint, so the page does not jump. */
.photo-finish__print--empty {
  display: grid;
  place-items: center;
  background: var(--color-surface-sunken);
  animation: none;
}

.photo-finish__hint {
  max-width: 36ch;
  padding: var(--space-4);
  color: var(--color-ink-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}

@media (min-width: 48rem) {
  .photo-finish__print {
    --print-height: 8.5rem;
  }
}

@media (min-width: 80rem) and (max-height: 56rem) {
  .photo-finish__print {
    --print-height: 6.5rem;
  }
}

/* The print develops from the finish line outwards, like the camera's scan. */
@keyframes develop {
  from {
    clip-path: inset(0 0 0 100%);
  }
  to {
    clip-path: inset(0);
  }
}
</style>
