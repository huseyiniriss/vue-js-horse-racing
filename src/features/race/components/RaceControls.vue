<script setup lang="ts">
import { computed, useId } from 'vue'

import AppButton from '@/shared/ui/AppButton.vue'

import { RACE_COPY } from '../copy'
import { useRaceStore } from '../store/race.store'

const race = useRaceStore()
const lockedHintId = useId()

const playbackLabel = computed(() => RACE_COPY[race.playbackAction ?? 'start'])
</script>

<template>
  <div class="race-controls">
    <AppButton
      data-testid="generate"
      :disabled="!race.canGenerate"
      :title="race.canGenerate ? undefined : RACE_COPY.generateLocked"
      :aria-describedby="race.canGenerate ? undefined : lockedHintId"
      @click="race.generateProgram()"
    >
      {{ RACE_COPY.generate }}
    </AppButton>
    <AppButton
      variant="primary"
      data-testid="playback"
      :disabled="race.playbackAction === null"
      @click="race.togglePlayback()"
    >
      {{ playbackLabel }}
    </AppButton>
    <p v-if="!race.canGenerate" :id="lockedHintId" class="visually-hidden">
      {{ RACE_COPY.generateLocked }}
    </p>
  </div>
</template>

<style scoped>
.race-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
