<script setup lang="ts">
import { useId } from 'vue'

import { HorseLabel } from '@/features/horses'

import type { RoundTableRow } from './round-table'
import SaddleCloth from './SaddleCloth.vue'

defineProps<{
  title: string
  subtitle: string
  leadKind: 'cloth' | 'position'
  leadLabel: string
  horseLabel: string
  trailingLabel?: string
  rows: readonly RoundTableRow[]
  isCurrent?: boolean
}>()

const headingId = useId()
</script>

<template>
  <article class="round-table" :class="{ 'round-table--current': isCurrent }">
    <h3 :id="headingId" class="round-table__heading">
      <span class="round-table__title">{{ title }}</span>
      <span class="round-table__subtitle">{{ subtitle }}</span>
    </h3>
    <table class="round-table__table" :aria-labelledby="headingId">
      <colgroup>
        <col class="round-table__lead-col" />
        <col />
        <col v-if="trailingLabel" class="round-table__trailing-col" />
      </colgroup>
      <thead class="visually-hidden">
        <tr>
          <th scope="col">{{ leadLabel }}</th>
          <th scope="col">{{ horseLabel }}</th>
          <th v-if="trailingLabel" scope="col">{{ trailingLabel }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.key">
          <td class="round-table__lead">
            <SaddleCloth v-if="leadKind === 'cloth'" :number="row.lead" />
            <span
              v-else
              class="round-table__position"
              :class="row.podium && `round-table__position--${row.podium}`"
            >
              {{ row.lead }}
            </span>
          </td>
          <td class="round-table__horse"><HorseLabel :horse="row.horse" /></td>
          <td v-if="trailingLabel" class="round-table__trailing">{{ row.trailing }}</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>

<style scoped>
.round-table {
  --lead-column-width: 3rem;
  --trailing-column-width: 4.5rem;

  font-size: var(--font-size-sm);
}

.round-table__heading {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface-sunken);
  border-block: var(--border-width) solid var(--color-line);
}

.round-table--current .round-table__heading {
  background: var(--color-highlight);
}

.round-table__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
}

.round-table__subtitle {
  color: var(--color-ink-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.round-table__table {
  width: 100%;
  table-layout: fixed;
}

.round-table__lead-col {
  width: var(--lead-column-width);
}

.round-table__trailing-col {
  width: var(--trailing-column-width);
}

.round-table__lead,
.round-table__horse,
.round-table__trailing {
  padding: var(--space-1) var(--space-2);
}

.round-table__lead {
  padding-left: var(--space-4);
}

.round-table__position {
  display: inline-block;
  min-width: var(--cloth-size);
  color: var(--color-ink-muted);
  font-weight: var(--font-weight-semibold);
  text-align: center;
}

.round-table__position--1 {
  color: var(--color-gold-text);
  font-weight: var(--font-weight-bold);
}

.round-table__position--2 {
  color: var(--color-silver-text);
  font-weight: var(--font-weight-bold);
}

.round-table__position--3 {
  color: var(--color-bronze-text);
  font-weight: var(--font-weight-bold);
}

.round-table__trailing {
  padding-right: var(--space-4);
  color: var(--color-ink-muted);
  text-align: right;
}

.round-table__table tbody tr:first-child .round-table__trailing {
  color: var(--color-ink);
  font-weight: var(--font-weight-semibold);
}
</style>
