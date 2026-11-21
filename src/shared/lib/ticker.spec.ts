import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAnimationFrameTicker } from './ticker'

describe('createAnimationFrameTicker', () => {
  let callbacks: FrameRequestCallback[] = []

  function runFrame(now: number) {
    const pending = callbacks
    callbacks = []
    for (const callback of pending) callback(now)
  }

  afterEach(() => {
    callbacks = []
  })

  function stubAnimationFrames() {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callbacks.push(callback)
      return callbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {
      callbacks = []
    })
  }

  it('reports the seconds between frames, skipping the first frame', () => {
    stubAnimationFrames()
    const onTick = vi.fn()
    createAnimationFrameTicker().start(onTick)

    runFrame(1000)
    runFrame(1016)
    runFrame(1048)

    expect(onTick).toHaveBeenCalledTimes(2)
    expect(onTick.mock.calls[0]?.[0]).toBeCloseTo(0.016)
    expect(onTick.mock.calls[1]?.[0]).toBeCloseTo(0.032)
  })

  it('caps long gaps, e.g. after the tab was in the background', () => {
    stubAnimationFrames()
    const onTick = vi.fn()
    createAnimationFrameTicker(0.1).start(onTick)

    runFrame(0)
    runFrame(30_000)

    expect(onTick).toHaveBeenCalledWith(0.1)
  })

  it('can be stopped from inside its own tick', () => {
    stubAnimationFrames()
    let stop: () => void = () => undefined
    const onTick = vi.fn(() => {
      stop()
    })
    stop = createAnimationFrameTicker().start(onTick)

    runFrame(0)
    runFrame(16)
    runFrame(32)

    expect(onTick).toHaveBeenCalledTimes(1)
  })

  it('stops ticking when stopped', () => {
    stubAnimationFrames()
    const onTick = vi.fn()
    const stop = createAnimationFrameTicker().start(onTick)

    runFrame(0)
    stop()
    runFrame(16)

    expect(onTick).not.toHaveBeenCalled()
  })
})
