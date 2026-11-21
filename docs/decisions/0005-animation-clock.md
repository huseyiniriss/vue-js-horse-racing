# 0005. One clock, one reactive value per frame

**Status:** accepted

## Context

Ten horses animate for six rounds. Updating ten reactive objects every frame, or
driving movement with `setInterval` and `left`, wastes work and stutters.

## Decision

- `useRaceClock` subscribes a `Ticker` while the status is `running` and calls
  `race.tick(deltaSeconds)`. The default ticker uses `requestAnimationFrame`.
- `tick` advances a single number, `elapsed` (race seconds). Lane positions are a
  computed value derived from it.
- Horses are moved with `transform: translateX()`, which the browser composites
  without layout.
- The ticker caps a frame's delta (0.1 s). Background tabs pause animation frames; when
  the tab returns, the race continues where it was instead of jumping to the end.
- `RACE_TIMING.playbackRate` maps race time to screen time (8×: a 75 s, 1200 m race
  takes about 9 s), and a 1.5 s intermission keeps the finished field on screen before
  the next round.
- The ticker is injected, so unit tests advance time by hand and Playwright freezes it
  with its fake clock.

## Consequences

- One reactive write per frame; rendering cost is ten transforms.
- The clock is owned by the app shell, not by the track component, so swapping or
  hiding the track view never stops the race.
