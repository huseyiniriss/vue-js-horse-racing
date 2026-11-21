# 0004. Two Pinia setup stores and an explicit state machine

**Status:** accepted

## Context

The game has data with different lifecycles: the stable of horses (created once per
session) and the race day (program, playback, results; regenerated on demand).
The Start/Pause and Generate buttons must behave correctly in every situation,
including mid-race and between rounds.

## Decision

- **Pinia, setup-store syntax.** Plain composition API, fully typed without
  annotations, the same mental model as components.
- **`horses` store:** the stable and lookups. Knows nothing about racing, so other
  features (betting, a stable view) can reuse it.
- **`race` store:** status, program, current round, elapsed time, results.
  It reads horses through the horses feature's public API.
- **Status machine** (`race-status.ts`): a typed transition table
  (`idle → ready → running ⇄ paused → finished`). Every action calls `transition()`,
  which throws on an illegal event. UI state such as `canGenerate` and the label of the
  Start/Pause button is derived from the same table, so buttons cannot drift from the rules.
- **Generate is not allowed while a race is running or paused.** It would silently
  destroy a race in progress; the button is disabled with an explanation instead.
- Immutable, replace-only structures (`schedule`, `results`, the round simulation) use
  `shallowRef`, so Vue does not deep-proxy data that never mutates.

## Consequences

- Illegal sequences (start before generate, generate mid-race) are impossible rather
  than merely unlikely, and the full status × event matrix is unit tested.
- Store state is writable from outside in principle (a Pinia trade-off); by convention
  components call actions only and never assign state.

## Alternatives considered

- **One store:** less wiring, but mixes lifecycles and makes horses impossible to reuse.
- **XState:** excellent for complex charts; a five-state machine does not justify the dependency.
- **Vuex:** in maintenance mode; Pinia is the official recommendation.
