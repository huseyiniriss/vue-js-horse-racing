<script setup lang="ts">
import gallop from '../assets/gallop-frames.json'

/**
 * A racehorse and jockey drawn from Eadweard Muybridge's "The Horse in Motion"
 * (1878, public domain), the photographic study that first showed how a horse gallops.
 *
 * The 15 frames are packed into sprites used as CSS masks, so each layer takes a
 * color from CSS and the gallop is a single `steps()` animation per layer:
 * the horse, the jockey's white breeches, and the jockey's silks, all in sync.
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

const [, , width = 1, height = 1] = gallop.viewBox.split(/\s+/).map(Number)
const frameCount = gallop.paths.length

function toMaskUrl(svgBody: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width * frameCount} ${height}">${svgBody}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const HORSE_SPRITE = toMaskUrl(
  gallop.paths.map((d, i) => `<path transform="translate(${width * i} 0)" d="${d}"/>`).join(''),
)

const JOCKEY_SPRITE = toMaskUrl(
  gallop.paths
    .map((d, i) => {
      const [x = 0, y = 0, w = 0, h = 0] = gallop.jockey[i] ?? []
      return (
        `<g transform="translate(${width * i} 0)">` +
        `<clipPath id="j${i}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>` +
        `<path clip-path="url(#j${i})" d="${d}"/></g>`
      )
    })
    .join(''),
)

const BREECHES_SPRITE = toMaskUrl(
  gallop.breeches.map((d, i) => `<path transform="translate(${width * i} 0)" d="${d}"/>`).join(''),
)

const ASPECT_RATIO = width / height
</script>

<template>
  <span
    class="horse-figure"
    :class="{ 'horse-figure--galloping': galloping }"
    :style="{
      '--frames': frameCount,
      '--frame': frame % frameCount,
      '--phase': phase,
      aspectRatio: ASPECT_RATIO,
    }"
    aria-hidden="true"
  >
    <span class="horse-figure__layer horse-figure__horse" :style="{ '--sprite': HORSE_SPRITE }" />
    <template v-if="jockey">
      <span
        class="horse-figure__layer horse-figure__breeches"
        :style="{ '--sprite': BREECHES_SPRITE }"
      />
      <span
        class="horse-figure__layer horse-figure__silks"
        :style="{ '--sprite': JOCKEY_SPRITE, '--jockey-color': jockey }"
      />
    </template>
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
  mask-image: var(--sprite);
  mask-repeat: no-repeat;
  mask-size: calc(var(--frames) * 100%) 100%;
  mask-position: calc(var(--frame) / (var(--frames) - 1) * 100%) 0;
}

.horse-figure__horse {
  background: currentColor;
}

.horse-figure__breeches {
  background: var(--color-breeches);
}

.horse-figure__silks {
  background: var(--jockey-color);
  /* A hairline halo keeps dark silks readable against a dark horse. */
  filter: drop-shadow(0 0 1px rgb(255 255 255 / 0.95))
    drop-shadow(0 0 0.5px rgb(255 255 255 / 0.95));
}

.horse-figure--galloping .horse-figure__layer {
  animation: gallop var(--duration-gallop) steps(var(--frames), jump-none) infinite;
  animation-delay: calc(var(--phase) * -61ms);
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
