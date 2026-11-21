<script setup lang="ts">
import { computed } from 'vue'

import { HorseList } from '@/features/horses'
import {
  ProgramPanel,
  RaceAnnouncer,
  RaceControls,
  RaceTrack,
  ResultsPanel,
  useRaceClock,
  useRaceStore,
} from '@/features/race'

import { replayUrl } from './bootstrap'
import { APP_COPY } from './copy'

// The app shell owns the clock, so the race keeps running whatever the track view does.
useRaceClock()

const race = useRaceStore()
const replayHref = computed(() => replayUrl(race.seed, window.location))
</script>

<template>
  <div class="app-shell">
    <header class="app-shell__header">
      <h1 class="app-shell__title">{{ APP_COPY.title }}</h1>
      <RaceControls />
    </header>

    <main class="app-shell__main">
      <HorseList class="app-shell__horses" />
      <RaceTrack class="app-shell__track" />
      <ProgramPanel class="app-shell__program" />
      <ResultsPanel class="app-shell__results" />
    </main>

    <footer class="app-shell__footer">
      <span data-testid="seed">{{ APP_COPY.seedLabel }} {{ race.seed }}</span>
      <a :href="replayHref">{{ APP_COPY.replayLink }}</a>
      <span class="app-shell__credits">{{ APP_COPY.credits }}</span>
    </footer>

    <RaceAnnouncer />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: var(--layout-max-width);
  min-height: 100dvh;
  margin: 0 auto;
  padding: var(--space-4);
}

.app-shell__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.app-shell__title {
  font-size: var(--font-size-2xl);
  font-stretch: var(--font-stretch-condensed);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

/* Mobile first: the race, then what happened, then what is coming, then the stable. */
.app-shell__main {
  display: grid;
  gap: var(--space-4);
  grid-template-areas:
    'track'
    'results'
    'program'
    'horses';
}

.app-shell__horses,
.app-shell__program,
.app-shell__results {
  max-height: 26rem;
}

.app-shell__horses {
  grid-area: horses;
}

.app-shell__track {
  grid-area: track;
  align-self: start;
}

.app-shell__program {
  grid-area: program;
}

.app-shell__results {
  grid-area: results;
}

.app-shell__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  color: var(--color-ink-muted);
  font-size: var(--font-size-xs);
}

.app-shell__footer a {
  color: var(--color-action);
}

.app-shell__credits {
  margin-left: auto;
}

@media (min-width: 48rem) {
  .app-shell {
    padding: var(--space-5);
  }

  .app-shell__main {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-areas:
      'track track track'
      'horses program results';
  }
}

/* Desktop: the case layout. Stable left, track centre, program and results right. */
@media (min-width: 80rem) {
  .app-shell {
    height: 100dvh;
  }

  .app-shell__main {
    flex: 1;
    min-height: 0;
    grid-template-columns: var(--panel-width) minmax(0, 1fr) var(--panel-width) var(--panel-width);
    grid-template-areas: 'horses track program results';
  }

  .app-shell__horses,
  .app-shell__program,
  .app-shell__results {
    max-height: none;
  }
}
</style>
