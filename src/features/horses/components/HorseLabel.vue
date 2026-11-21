<script setup lang="ts">
import type { Horse } from '../domain/horse'

defineProps<{ horse: Horse }>()
</script>

<template>
  <span class="horse-label">
    <span class="horse-label__swatch" :style="{ backgroundColor: horse.color.hex }" />
    <span class="horse-label__name">{{ horse.name }}</span>
  </span>
</template>

<style scoped>
.horse-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.horse-label__swatch {
  flex: none;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.2);
}

.horse-label__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
