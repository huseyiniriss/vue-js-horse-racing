import { nextTick, watch, type ComponentPublicInstance, type Ref } from 'vue'

/**
 * Keeps the item for `activeKey` visible inside a scrollable panel, e.g. the round
 * being raced in the program or the newest result.
 */
export function useScrollIntoView(activeKey: Readonly<Ref<number | null>>) {
  const elements = new Map<number, Element>()

  function setItemRef(key: number, el: Element | ComponentPublicInstance | null): void {
    if (el instanceof Element) elements.set(key, el)
    else elements.delete(key)
  }

  watch(activeKey, async (key) => {
    if (key === null) return
    await nextTick()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    elements.get(key)?.scrollIntoView({
      block: 'nearest',
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  })

  return { setItemRef }
}
