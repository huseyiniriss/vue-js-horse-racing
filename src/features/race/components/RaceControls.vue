<script setup lang="ts">
import { computed, useId, useTemplateRef, watch } from 'vue'

import AppButton from '@/shared/ui/AppButton.vue'

import { RACE_COPY } from '../copy'
import { useRaceStore } from '../store/race.store'

const race = useRaceStore()
const generateHintId = useId()
const playbackHintId = useId()
const root = useTemplateRef<HTMLElement>('root')

const playbackLabel = computed(() => RACE_COPY[race.playbackAction ?? 'start'])
const playbackHint = computed(() => (race.status === 'idle' ? RACE_COPY.startLocked : null))

// When the day ends the focused Pause button becomes disabled; keep keyboard users in
// place by moving focus to the next useful control.
watch(
  () => race.status,
  (status) => {
    const buttons = root.value?.querySelectorAll('button')
    if (status === 'finished' && buttons?.[1] === document.activeElement) buttons[0]?.focus()
  },
  { flush: 'post' },
)
</script>

<template>
  <div ref="root" class="race-controls">
    <AppButton
      data-testid="generate"
      :disabled="!race.canGenerate"
      :title="race.canGenerate ? undefined : RACE_COPY.generateLocked"
      :aria-describedby="race.canGenerate ? undefined : generateHintId"
      @click="race.generateProgram()"
    >
      {{ RACE_COPY.generate }}
    </AppButton>
    <AppButton
      variant="primary"
      data-testid="playback"
      :disabled="race.playbackAction === null"
      :title="playbackHint ?? undefined"
      :aria-describedby="playbackHint ? playbackHintId : undefined"
      @click="race.togglePlayback()"
    >
      {{ playbackLabel }}
    </AppButton>
    <p v-if="!race.canGenerate" :id="generateHintId" class="visually-hidden">
      {{ RACE_COPY.generateLocked }}
    </p>
    <p v-if="playbackHint" :id="playbackHintId" class="visually-hidden">{{ playbackHint }}</p>
  </div>
</template>

<style scoped>
.race-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
