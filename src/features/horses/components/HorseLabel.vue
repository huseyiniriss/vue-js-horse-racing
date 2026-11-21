<script setup lang="ts">
import type { Horse } from '../domain/horse'
import SilksIcon from './SilksIcon.vue'

defineProps<{ horse: Horse }>()
</script>

<template>
  <span class="horse-label">
    <SilksIcon :silks="horse.silks" />
    <span class="horse-label__name" :title="horse.name">{{ horse.name }}</span>
  </span>
</template>

<style scoped>
.horse-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.horse-label__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
