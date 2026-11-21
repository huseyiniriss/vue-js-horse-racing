<script setup lang="ts">
import PanelSection from '@/shared/ui/PanelSection.vue'

import { HORSES_COPY } from '../copy'
import { useHorsesStore } from '../store/horses.store'
import HorseLabel from './HorseLabel.vue'

const horses = useHorsesStore()
</script>

<template>
  <PanelSection :title="HORSES_COPY.listTitle">
    <template #meta>
      <span class="horse-list__count">{{ HORSES_COPY.listCount(horses.horses.length) }}</span>
    </template>

    <table class="horse-list">
      <colgroup>
        <col />
        <col class="horse-list__condition-col" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">{{ HORSES_COPY.columnName }}</th>
          <th scope="col" class="horse-list__numeric">{{ HORSES_COPY.columnCondition }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="horse in horses.horses" :key="horse.id" data-testid="horse-row">
          <th scope="row" class="horse-list__name">
            <HorseLabel :horse="horse" />
            <span class="visually-hidden">
              {{ HORSES_COPY.colorLabel(horse.color.name, horse.silks.pattern) }}
            </span>
          </th>
          <td class="horse-list__numeric">
            <span class="horse-list__condition">
              <span
                class="horse-list__meter"
                role="meter"
                :aria-valuenow="horse.condition"
                aria-valuemin="1"
                aria-valuemax="100"
                :aria-label="HORSES_COPY.conditionLabel(horse.condition)"
                :style="{ '--condition': horse.condition / 100 }"
              />
              {{ horse.condition }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </PanelSection>
</template>

<style scoped>
.horse-list {
  width: 100%;
  table-layout: fixed;
  font-size: var(--font-size-sm);
}

.horse-list__condition-col {
  width: 6.5rem;
}

.horse-list__count {
  color: var(--color-ink-muted);
  font-size: var(--font-size-xs);
}

.horse-list th,
.horse-list td {
  padding: var(--space-2) var(--space-3);
  text-align: left;
}

.horse-list thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-surface-sunken);
  color: var(--color-ink-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.horse-list tbody tr + tr {
  border-top: var(--border-width) solid var(--color-line);
}

.horse-list__name {
  font-weight: var(--font-weight-medium);
}

.horse-list .horse-list__numeric {
  text-align: right;
}

.horse-list__condition {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
}

.horse-list__meter {
  width: 2.5rem;
  height: 0.375rem;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    to right,
    var(--color-action) calc(var(--condition) * 100%),
    var(--color-line) 0
  );
}
</style>
