# 0002. The race is decided up front, then played back

**Status:** accepted

## Context

Common implementations move horses by a random step on every timer tick and read the
winner from the screen, or roll the result after the animation. Both break easily:
the outcome depends on frame rate, pausing must freeze a running simulation, and the
animation can disagree with the result.

## Decision

When a round starts, `simulateRound` gives every runner a pace per track segment:

```
speed = baseSpeed × conditionFactor × form × segmentVariation
conditionFactor = 1 + 0.06 × (condition − 50) / 50     // ±6 % between condition 1 and 100
form            = 1 ± 3 %                               // the horse's day, once per round
segmentVariation = 1 ± 6 %                              // per segment (8 segments): overtakes
```

From that, the finish time of every runner, the finishing order (`rankRunners`) and
the distance covered at any moment (`distanceCovered`) are pure functions. The
animation only asks _where is this horse at time t?_

All coefficients live in `race.rules.ts`.

## Consequences

- What you see is the result: the order horses cross the line is the order in the
  Results panel (tested).
- Frame-rate independent: 24, 60 and 144 fps produce identical results (tested).
- Pause is "stop advancing t"; resume continues at the exact same positions (tested).
- Any renderer (DOM today, canvas/WebGL later) can draw the race from the same data.
- Condition matters but is not destiny: in 1,000 simulated head-to-heads a condition-90
  horse beats a condition-10 horse more than 95 % of the time, while 60 vs 50 stays
  between 55 % and 90 % (tested).

## Alternatives considered

- **Step simulation per frame:** feels "live" but couples results to frame timing and
  makes deterministic tests hard.
- **Roll results, then animate towards them:** easy to get the animation out of sync
  with the result, and overtakes have to be faked.
