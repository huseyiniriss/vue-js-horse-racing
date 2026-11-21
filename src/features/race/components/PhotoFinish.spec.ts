import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { useHorsesStore } from '@/features/horses'
import { setupGame } from '@/test/setup-game'

import { useRaceStore } from '../store/race.store'
import PhotoFinish from './PhotoFinish.vue'

async function mountAfterRounds(rounds: number) {
  const pinia = setupGame()
  const wrapper = mount(PhotoFinish, { global: { plugins: [pinia] } })
  const race = useRaceStore()
  race.generateProgram()
  race.start()
  for (let round = 0; round < rounds; round++) race.tick(10_000)
  await nextTick()
  return { wrapper, race, horses: useHorsesStore() }
}

const offsetOf = (element: Element) =>
  Number((element as HTMLElement).style.getPropertyValue('--offset'))

describe('PhotoFinish', () => {
  it('keeps its place with a hint before the first result', async () => {
    const { wrapper } = await mountAfterRounds(0)
    expect(wrapper.find('[data-testid="photo-finish"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('prints each round here')
  })

  it('prints the latest round with the winner and winning margin', async () => {
    const { wrapper, race, horses } = await mountAfterRounds(2)
    const [first, second] = race.results[1]!.placings
    const margin = (second!.finishTime - first!.finishTime).toFixed(2)

    expect(wrapper.text()).toContain('Photo finish, round 2')
    expect(wrapper.get('[data-testid="photo-verdict"]').text()).toBe(
      `${horses.getHorse(first!.horseId).name} wins by ${margin} s`,
    )
  })

  it('places the winner on the line and the others by time gap, in order', async () => {
    const { wrapper } = await mountAfterRounds(1)
    const offsets = wrapper
      .findAll('.photo-finish__runner')
      .map((runner) => offsetOf(runner.element))

    expect(offsets).toHaveLength(10)
    expect(offsets[0]).toBe(0)
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b))
    expect(Math.max(...offsets)).toBeLessThanOrEqual(1)
  })

  it('labels the time scale with at most six readable ticks', async () => {
    const { wrapper } = await mountAfterRounds(1)
    const ticks = wrapper.findAll('.photo-finish__tick').map((tick) => tick.text())

    expect(ticks[0]).toBe('Winner')
    expect(ticks.length).toBeGreaterThanOrEqual(2)
    expect(ticks.length).toBeLessThanOrEqual(6)
    for (const tick of ticks.slice(1)) expect(tick).toMatch(/^\+\d+(\.\d)? s$/)
  })
})
