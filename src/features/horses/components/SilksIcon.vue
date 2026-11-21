<script setup lang="ts">
import { useId } from 'vue'

import type { Silks } from '../domain/horse'

/** A jockey's jacket and cap in the owner's registered design. */
defineProps<{ silks: Silks }>()

const clipId = useId()

const JACKET =
  'M10 9.5 13.5 8c1.2 1.4 3.8 1.4 5 0L22 9.5l7 6.5-3.2 3.4-3.3-3V30h-13V16.4l-3.3 3L2 16Z'
</script>

<template>
  <svg class="silks-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <defs>
      <clipPath :id="clipId">
        <path :d="JACKET" />
      </clipPath>
    </defs>

    <path :d="JACKET" :fill="silks.body" />
    <g :clip-path="`url(#${clipId})`" :fill="silks.trim" :stroke="silks.trim">
      <g v-if="silks.pattern === 'hoops'" stroke="none">
        <rect x="0" y="13" width="32" height="3" />
        <rect x="0" y="19" width="32" height="3" />
        <rect x="0" y="25" width="32" height="3" />
      </g>
      <g v-else-if="silks.pattern === 'stripes'" stroke="none">
        <rect x="11" y="0" width="2.4" height="32" />
        <rect x="14.8" y="0" width="2.4" height="32" />
        <rect x="18.6" y="0" width="2.4" height="32" />
      </g>
      <g v-else-if="silks.pattern === 'chevrons'" fill="none" stroke-width="2.6">
        <path d="M6 13l10 6 10-6" />
        <path d="M6 20l10 6 10-6" />
      </g>
      <g v-else-if="silks.pattern === 'quartered'" stroke="none">
        <rect x="16" y="0" width="16" height="18" />
        <rect x="0" y="18" width="16" height="14" />
      </g>
      <path v-else-if="silks.pattern === 'sash'" d="M9 8l15 22" fill="none" stroke-width="4.2" />
      <path
        v-else-if="silks.pattern === 'star'"
        d="M16 13.2l1.7 3.5 3.8.5-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.5Z"
        stroke="none"
      />
      <g v-else-if="silks.pattern === 'spots'" stroke="none">
        <circle cx="12.5" cy="14" r="1.7" />
        <circle cx="19.5" cy="14" r="1.7" />
        <circle cx="16" cy="19.5" r="1.7" />
        <circle cx="12.5" cy="25" r="1.7" />
        <circle cx="19.5" cy="25" r="1.7" />
      </g>
      <rect
        v-else-if="silks.pattern === 'halved'"
        x="16"
        y="0"
        width="16"
        height="32"
        stroke="none"
      />
      <g v-else-if="silks.pattern === 'cross-belts'" fill="none" stroke-width="2.8">
        <path d="M9 9l14 21" />
        <path d="M23 9 9 30" />
      </g>
      <path v-else-if="silks.pattern === 'diamond'" d="M16 12.5l5 7-5 7-5-7Z" stroke="none" />
    </g>
    <path :d="JACKET" fill="none" class="silks-icon__outline" />

    <!-- Cap -->
    <path d="M11.3 7.4a4.7 4.7 0 0 1 9.4 0Z" :fill="silks.trim" class="silks-icon__cap" />
    <path d="M20.2 7.2h3.3" :stroke="silks.trim" stroke-width="1.6" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.silks-icon {
  display: block;
  flex: none;
  width: var(--silks-size);
  height: var(--silks-size);
}

.silks-icon__outline,
.silks-icon__cap {
  stroke: rgb(0 0 0 / 0.38);
  stroke-width: 0.9;
  stroke-linejoin: round;
}
</style>
