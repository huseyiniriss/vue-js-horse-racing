import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { useHorsesStore } from '@/features/horses'
import { setupGame } from '@/test/setup-game'

import { useRaceStore } from '../store/race.store'
import ProgramPanel from './ProgramPanel.vue'

describe('ProgramPanel', () => {
  it('invites the user to generate a program', () => {
    const wrapper = mount(ProgramPanel, { global: { plugins: [setupGame()] } })
    expect(wrapper.text()).toContain('Generate a program to draw six rounds of ten horses.')
  })

  it('lists six rounds with saddle cloths and horses in lane order', async () => {
    const wrapper = mount(ProgramPanel, { global: { plugins: [setupGame()] } })
    const race = useRaceStore()
    const horses = useHorsesStore()
    race.generateProgram()
    await nextTick()

    const rounds = wrapper.findAll('[data-testid="program-round"]')
    expect(rounds).toHaveLength(6)
    const firstRows = rounds[0]!.findAll('tbody tr')
    expect(firstRows).toHaveLength(10)
    race.schedule[0]!.lanes.forEach((horseId, lane) => {
      expect(firstRows[lane]!.get('.saddle-cloth').text()).toBe(String(lane + 1))
      expect(firstRows[lane]!.text()).toContain(horses.getHorse(horseId).name)
    })
  })

  it('marks the round being raced as the current step', async () => {
    const wrapper = mount(ProgramPanel, { global: { plugins: [setupGame()] } })
    const race = useRaceStore()
    race.generateProgram()
    race.start()
    race.tick(10_000) // settles round 1 and runs past the intermission: round 2 begins
    await nextTick()

    const current = wrapper.findAll('[aria-current="step"]')
    expect(current).toHaveLength(1)
    expect(current[0]!.text()).toContain('Round 2')
  })
})
