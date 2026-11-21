import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import { SCROLL_CONTAINER_ATTRIBUTE, useScrollIntoView } from './useScrollIntoView'

function rect(top: number): DOMRect {
  return {
    top,
    bottom: top,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }
}

function mountList() {
  const active = ref<number | null>(null)
  const Harness = defineComponent({
    setup() {
      const { setItemRef } = useScrollIntoView(active)
      return () =>
        h('div', { [SCROLL_CONTAINER_ATTRIBUTE]: '', class: 'container' }, [
          [0, 1, 2].map((key) =>
            h('div', {
              key,
              class: `item-${key}`,
              ref: (el) => {
                setItemRef(key, el)
              },
            }),
          ),
        ])
    },
  })
  const wrapper = mount(Harness, { attachTo: document.body })
  const container = wrapper.get('.container').element as HTMLElement
  return { wrapper, active, container }
}

describe('useScrollIntoView', () => {
  it('scrolls only its panel so the active item sits at the top', async () => {
    const { wrapper, active, container } = mountList()
    container.scrollTop = 40
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(rect(100))
    vi.spyOn(wrapper.get('.item-2').element, 'getBoundingClientRect').mockReturnValue(rect(400))
    const scrollTo = vi.spyOn(container, 'scrollTo')
    const pageScroll = vi.spyOn(window, 'scrollTo')

    active.value = 2
    await nextTick()
    await nextTick()

    expect(scrollTo).toHaveBeenCalledWith({ top: 340, behavior: 'smooth' })
    expect(pageScroll).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('does nothing when there is no active item', async () => {
    const { wrapper, active, container } = mountList()
    const scrollTo = vi.spyOn(container, 'scrollTo')
    active.value = 1
    active.value = null
    await nextTick()
    await nextTick()
    expect(scrollTo).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
