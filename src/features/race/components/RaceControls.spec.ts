import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { setupGame } from '@/test/setup-game'

import { useRaceStore } from '../store/race.store'
import RaceControls from './RaceControls.vue'

function mountControls() {
  const pinia = setupGame()
  const wrapper = mount(RaceControls, { global: { plugins: [pinia] } })
  return {
    wrapper,
    race: useRaceStore(),
    generate: () => wrapper.get('[data-testid="generate"]'),
    playback: () => wrapper.get('[data-testid="playback"]'),
  }
}

describe('RaceControls', () => {
  it('only allows generating before a program exists', () => {
    const { generate, playback } = mountControls()
    expect(generate().attributes('disabled')).toBeUndefined()
    expect(playback().attributes('disabled')).toBeDefined()
    expect(playback().text()).toBe('Start')
  })

  it('generates a program and starts the race', async () => {
    const { race, generate, playback } = mountControls()

    await generate().trigger('click')
    expect(race.status).toBe('ready')

    await playback().trigger('click')
    expect(race.status).toBe('running')
    expect(playback().text()).toBe('Pause')
  })

  it('pauses and resumes from the same button', async () => {
    const { race, generate, playback } = mountControls()
    await generate().trigger('click')
    await playback().trigger('click')

    await playback().trigger('click')
    expect(race.status).toBe('paused')
    expect(playback().text()).toBe('Resume')

    await playback().trigger('click')
    expect(race.status).toBe('running')
  })

  it('locks Generate during a race and explains why', async () => {
    const { wrapper, generate, playback } = mountControls()
    await generate().trigger('click')
    await playback().trigger('click')

    expect(generate().attributes('disabled')).toBeDefined()
    const hintId = generate().attributes('aria-describedby')
    expect(hintId).toBeTruthy()
    expect(wrapper.get(`#${CSS.escape(hintId!)}`).text()).toContain('race day ends')
  })
})
