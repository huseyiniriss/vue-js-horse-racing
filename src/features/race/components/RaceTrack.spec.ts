import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { setupGame } from '@/test/setup-game'

import { useRaceStore } from '../store/race.store'
import RaceTrack from './RaceTrack.vue'

describe('RaceTrack', () => {
  it('keeps ten empty lanes and a hint before a program exists', () => {
    const pinia = setupGame()
    const wrapper = mount(RaceTrack, { global: { plugins: [pinia] } })
    expect(wrapper.findAll('li')).toHaveLength(10)
    expect(wrapper.findAll('[data-testid="runner"]')).toHaveLength(0)
    expect(wrapper.text()).toContain('Generate a program')
  })

  it('lines up the round field and moves horses from the store state', async () => {
    const pinia = setupGame()
    const race = useRaceStore()
    const wrapper = mount(RaceTrack, { global: { plugins: [pinia] } })

    race.generateProgram()
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-testid="round-title"]').text()).toBe('Round 1 of 6')
    const runners = () => wrapper.findAll('[data-testid="runner"]')
    expect(runners()).toHaveLength(10)
    const progressOf = (runner: ReturnType<typeof runners>[number]) =>
      Number((runner.element as HTMLElement).style.getPropertyValue('--progress'))
    expect(runners().every((runner) => progressOf(runner) === 0)).toBe(true)

    race.start()
    race.tick(1)
    await wrapper.vm.$nextTick()
    const progress = runners().map(progressOf)
    expect(progress.every((value) => value > 0 && value < 1)).toBe(true)
  })
})
