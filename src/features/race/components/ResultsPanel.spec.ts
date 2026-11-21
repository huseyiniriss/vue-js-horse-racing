import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useHorsesStore } from '@/features/horses'
import { setupGame } from '@/test/setup-game'

import { useRaceStore } from '../store/race.store'
import ResultsPanel from './ResultsPanel.vue'

describe('ResultsPanel', () => {
  it('invites the user to race while there are no results', () => {
    const pinia = setupGame()
    const wrapper = mount(ResultsPanel, { global: { plugins: [pinia] } })
    expect(wrapper.text()).toContain('Results appear here as each round finishes.')
  })

  it('lists each finished round racecard style: winner time, then gaps', async () => {
    const pinia = setupGame()
    const race = useRaceStore()
    const horses = useHorsesStore()
    const wrapper = mount(ResultsPanel, {
      global: { plugins: [pinia], stubs: { transition: false } },
    })

    race.generateProgram()
    race.start()
    race.tick(10_000) // finish round 1 in one go
    await wrapper.vm.$nextTick()

    const rounds = wrapper.findAll('[data-testid="result-round"]')
    expect(rounds).toHaveLength(1)
    expect(rounds[0]!.get('h3').text()).toContain('Round 1')
    expect(rounds[0]!.get('h3').text()).toContain('1,200 m')

    const rows = rounds[0]!.findAll('tbody tr')
    expect(rows).toHaveLength(10)
    const winner = race.results[0]!.placings[0]!
    expect(rows[0]!.text()).toContain('1')
    expect(rows[0]!.text()).toContain(horses.getHorse(winner.horseId).name)
    expect(rows[0]!.text()).toMatch(/\d:\d{2}\.\d{2}/)
    expect(rows[1]!.text()).toMatch(/\+\d+\.\d{2}/)
  })
})
