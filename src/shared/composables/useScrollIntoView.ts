import { nextTick, watch, type ComponentPublicInstance, type Ref } from 'vue'

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
    const container = item?.closest<HTMLElement>('[data-scroll-container]')
    if (!item || !container) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    container.scrollTo({
      top: item.offsetTop - container.offsetTop,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  })

  return { setItemRef }
}
