<script setup lang="ts">
import { GALLOP_ASPECT_RATIO, GALLOP_FRAME_COUNT } from '../assets/gallop.meta'

/**
 * A racehorse and jockey drawn from Eadweard Muybridge's "The Horse in Motion"
 * (1878, public domain), the photographic study that first showed how a horse gallops.
 *
 * The 15 frames live in static sprites (built by `npm run sprites`) used as CSS masks:
 * the horse, the jockey's white breeches, and the jockey in the silks color. Each layer
 * runs the same `steps()` animation, so they stay in sync.
 */
withDefaults(
  defineProps<{
    /** Silks color worn by the jockey. Without it the rider matches the horse. */
    jockey?: string
    /** Cycle through the gallop. */
    galloping?: boolean
    /** Frame shown when not galloping. */
    frame?: number
    /** Desynchronises neighbouring horses so the field does not stride in lockstep. */
    phase?: number
  }>(),
  { jockey: undefined, galloping: false, frame: 0, phase: 0 },
)
</script>

<template>
  <span
    class="horse-figure"
    :class="{ 'horse-figure--galloping': galloping }"
    :style="{
      '--frames': GALLOP_FRAME_COUNT,
      '--frame': frame % GALLOP_FRAME_COUNT,
      '--phase': phase,
      aspectRatio: GALLOP_ASPECT_RATIO,
    }"
    aria-hidden="true"
  >
    <span class="horse-figure__layer horse-figure__horse" />
    <span v-if="jockey" class="horse-figure__layer horse-figure__breeches" />
    <span
      v-if="jockey"
      class="horse-figure__layer horse-figure__silks"
      :style="{ '--jockey-color': jockey }"
    />
  </span>
</template>

<style scoped>
.horse-figure {
  position: relative;
  display: block;
  width: 100%;
}

.horse-figure__layer {
  position: absolute;
  inset: 0;
  mask-repeat: no-repeat;
  mask-size: calc(var(--frames) * 100%) 100%;
  mask-position: calc(var(--frame) / (var(--frames) - 1) * 100%) 0;
}

.horse-figure__horse {
  background: currentColor;
  mask-image: url('../assets/gallop-horse.svg');
}

.horse-figure__breeches {
  background: var(--color-breeches);
  mask-image: url('../assets/gallop-breeches.svg');
  filter: var(--breeches-edge);
}

.horse-figure__silks {
  background: var(--jockey-color);
  mask-image: url('../assets/gallop-jockey.svg');
  /* A hairline halo keeps dark silks readable against a dark horse. */
  filter: var(--silks-halo);
}

.horse-figure--galloping .horse-figure__layer {
  animation: gallop var(--duration-gallop) steps(var(--frames), jump-none) infinite;
  animation-delay: calc(var(--phase) * var(--gallop-phase-step));
}

@keyframes gallop {
  from {
    mask-position: 0% 0;
  }
  to {
    mask-position: 100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .horse-figure--galloping .horse-figure__layer {
    animation: none;
  }
}
</style>
