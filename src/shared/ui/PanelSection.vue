<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  /** Visible heading; also names the region for assistive technology. */
  title: string
}>()

const headingId = useId()
</script>

<template>
  <section class="panel-section" :aria-labelledby="headingId">
    <header class="panel-section__header">
      <h2 :id="headingId" class="panel-section__title">{{ title }}</h2>
      <slot name="meta" />
    </header>
    <div class="panel-section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.panel-section__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--border-width) solid var(--color-line);
}

.panel-section__title {
  font-size: var(--font-size-lg);
  font-stretch: var(--font-stretch-condensed);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.panel-section__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
