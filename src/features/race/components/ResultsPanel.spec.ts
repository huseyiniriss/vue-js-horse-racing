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
    const wrapper = mount(ResultsPanel, { global: { plugins: [pinia] } })

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
    const [winner, second] = race.results[0]!.placings
    const cells = (row: number) => rows[row]!.findAll('td').map((cell) => cell.text())

    expect(cells(0)[0]).toBe('1')
    expect(cells(0)[1]).toBe(horses.getHorse(winner!.horseId).name)
    expect(cells(0)[2]).toMatch(/^\d:\d{2}\.\d{2}$/)
    expect(cells(1)[0]).toBe('2')
    expect(cells(1)[2]).toBe(`+${(second!.finishTime - winner!.finishTime).toFixed(2)}`)
  })
})
