import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { setupGame } from '@/test/setup-game'

import { useHorsesStore } from '../store/horses.store'
import HorseList from './HorseList.vue'

describe('HorseList', () => {
  it('shows every horse with its condition and color', () => {
    const pinia = setupGame()
    const wrapper = mount(HorseList, { global: { plugins: [pinia] } })
    const rows = wrapper.findAll('[data-testid="horse-row"]')
    const [first] = useHorsesStore().horses

    expect(rows).toHaveLength(20)
    expect(rows[0]!.text()).toContain(first!.name)
    expect(rows[0]!.text()).toContain(String(first!.condition))
    expect(rows[0]!.text()).toContain(first!.color.name)
    expect(rows[0]!.get('[role="meter"]').attributes('aria-valuenow')).toBe(
      String(first!.condition),
    )
  })
})
