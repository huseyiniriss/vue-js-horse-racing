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
    <!-- Focusable so keyboard users can scroll long lists (WCAG 2.1.1). -->
    <div
      class="panel-section__body"
      tabindex="0"
      :aria-labelledby="headingId"
      role="group"
      data-scroll-container
    >
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
  /* A printed racecard: a heavy rule on top, square corners. */
  border-top: 3px solid var(--color-ink);
  border-radius: var(--radius-sm);
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
  letter-spacing: var(--letter-spacing-display);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.panel-section__body {
  position: relative;
  flex: 1;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.panel-section__body:focus-visible {
  box-shadow: inset var(--focus-ring);
}
</style>
