import { nextTick, watch, type ComponentPublicInstance, type Ref } from 'vue'

export const SCROLL_CONTAINER_ATTRIBUTE = 'data-scroll-container'

/**
 * Keeps the item for `activeKey` in view inside its scrollable panel, e.g. the round
 * being raced in the program or the newest result.
 *
 * Only the panel scrolls: `Element.scrollIntoView` would also scroll the page, which
 * on a phone yanks the race off screen whenever a round changes.
 */
export function useScrollIntoView(activeKey: Readonly<Ref<number | null>>) {
  const elements = new Map<number, HTMLElement>()

  function setItemRef(key: number, el: Element | ComponentPublicInstance | null): void {
    if (el instanceof HTMLElement) elements.set(key, el)
    else elements.delete(key)
  }

  watch(activeKey, async (key) => {
    if (key === null) return
    await nextTick()
    const item = elements.get(key)
    const container = item?.closest<HTMLElement>(`[${SCROLL_CONTAINER_ATTRIBUTE}]`)
    if (!item || !container) return

    // Measured from layout boxes, so it does not depend on which ancestor is the offsetParent.
    const top =
      item.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    container.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })
  })

  return { setItemRef }
}
