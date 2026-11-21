<script setup lang="ts">
/** The numbered cloth under the saddle: how a racecard and the track refer to a runner. */
defineProps<{ number: number }>()
</script>

<template>
  <span class="saddle-cloth">{{ number }}</span>
</template>

<style scoped>
.saddle-cloth {
  display: inline-grid;
  place-items: center;
  min-width: var(--cloth-size);
  height: var(--cloth-size);
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
  background: var(--color-ink);
  color: var(--color-ink-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}
</style>
