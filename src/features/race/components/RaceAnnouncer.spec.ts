import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { useHorsesStore } from '@/features/horses'
import { setupGame } from '@/test/setup-game'

import { useRaceStore } from '../store/race.store'
import RaceAnnouncer from './RaceAnnouncer.vue'

function mountAnnouncer() {
  const pinia = setupGame()
  const wrapper = mount(RaceAnnouncer, { global: { plugins: [pinia] } })
  return { wrapper, race: useRaceStore(), horses: useHorsesStore() }
}

describe('RaceAnnouncer', () => {
  it('is a polite live region', () => {
    const { wrapper } = mountAnnouncer()
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-live')).toBe('polite')
  })

  it('announces the start of a round', async () => {
    const { wrapper, race } = mountAnnouncer()
    race.generateProgram()
    race.start()
    await nextTick()
    expect(wrapper.text()).toBe('Round 1 is off, 1,200 m.')
  })

  it('does not re-announce the round when resuming from a pause', async () => {
    const { wrapper, race, horses } = mountAnnouncer()
    race.generateProgram()
    race.start()
    race.tick(10_000) // round 1 finishes
    await nextTick()
    const winner = horses.getHorse(race.results[0]!.placings[0]!.horseId).name
    expect(wrapper.text()).toBe(`Round 1 finished. ${winner} wins.`)

    race.pause()
    await nextTick()
    race.resume()
    await nextTick()
    expect(wrapper.text()).toBe(`Round 1 finished. ${winner} wins.`)
  })

  it('announces the winner and the end of the race day', async () => {
    const { wrapper, race, horses } = mountAnnouncer()
    race.generateProgram()
    race.start()
    for (let round = 0; round < 6; round++) race.tick(10_000)
    await nextTick()

    expect(race.status).toBe('finished')
    const winner = horses.getHorse(race.results[5]!.placings[0]!.horseId).name
    expect(wrapper.text()).toBe(`Round 6 finished. ${winner} wins. All rounds are finished.`)
  })
})
