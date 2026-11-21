<script setup lang="ts">
import { HorseLabel, type Horse } from '@/features/horses'

export interface RoundTableRow {
  readonly key: string | number
  readonly lead: string | number
  readonly horse: Horse
  readonly trailing?: string
  /** Podium styling for the first three of a result. */
  readonly podium?: 1 | 2 | 3
}

defineProps<{
  heading: string
  leadLabel: string
  horseLabel: string
  trailingLabel?: string
  rows: readonly RoundTableRow[]
  isCurrent?: boolean
}>()
</script>

<template>
  <table class="round-table" :class="{ 'round-table--current': isCurrent }">
    <caption class="round-table__caption">
      {{
        heading
      }}
    </caption>
    <thead class="visually-hidden">
      <tr>
        <th scope="col">{{ leadLabel }}</th>
        <th scope="col">{{ horseLabel }}</th>
        <th v-if="trailingLabel" scope="col">{{ trailingLabel }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.key">
        <td class="round-table__lead" :class="row.podium && `round-table__lead--${row.podium}`">
          {{ row.lead }}
        </td>
        <td class="round-table__horse"><HorseLabel :horse="row.horse" /></td>
        <td v-if="trailingLabel" class="round-table__trailing">{{ row.trailing }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.round-table {
  width: 100%;
  table-layout: fixed;
  font-size: var(--font-size-sm);
}

.round-table__caption {
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface-sunken);
  border-block: var(--border-width) solid var(--color-line);
  font-stretch: var(--font-stretch-condensed);
  font-weight: var(--font-weight-bold);
  text-align: left;
}

.round-table--current .round-table__caption {
  background: var(--color-highlight);
}

.round-table__lead,
.round-table__horse,
.round-table__trailing {
  padding: var(--space-1) var(--space-2);
}

.round-table__lead {
  width: 2.75rem;
  padding-left: var(--space-4);
  color: var(--color-ink-muted);
  font-weight: var(--font-weight-medium);
}

.round-table__lead--1 {
  color: var(--color-gold);
  font-weight: var(--font-weight-bold);
}

.round-table__lead--2 {
  color: var(--color-silver);
  font-weight: var(--font-weight-bold);
}

.round-table__lead--3 {
  color: var(--color-bronze);
  font-weight: var(--font-weight-bold);
}

.round-table__horse {
  overflow: hidden;
}

.round-table__trailing {
  width: 4.25rem;
  padding-right: var(--space-4);
  color: var(--color-ink-muted);
  text-align: right;
}
</style>
