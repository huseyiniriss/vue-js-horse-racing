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
- **State is exposed read-only** (`readonly()` refs): components can read everything but
  change nothing except through actions, so the status machine cannot be bypassed.
  `configure()` is only allowed before the first Generate.
- **Rounds settle explicitly:** a round is settled when its result is recorded. The race
  day completes as soon as the last round settles; earlier rounds keep the finished field
  on screen for a short intermission first.
- Immutable, replace-only structures (`schedule`, `results`, the round simulation) use
  `shallowRef`, so Vue does not deep-proxy data that never mutates.

## Consequences

- Illegal sequences (start before generate, generate mid-race) are impossible rather
  than merely unlikely, and the full status × event matrix is unit tested.
- The engine's per-round simulation stays private to the store; the UI reads derived
  `lanes` (progress, finished, position) instead.
- Trade-off: Pinia only treats returned, writable refs as state. Read-only and private
  state does not show up as editable in devtools, is skipped by plugins such as
  persistence, and would need manual hydration under SSR. This app has no SSR and no
  persistence, and the store's integrity matters more than editing it from devtools.
  If either is ever needed, return the plain refs and keep the guarantee in the actions.

## Alternatives considered

- **One store:** less wiring, but mixes lifecycles and makes horses impossible to reuse.
- **XState:** excellent for complex charts; a five-state machine does not justify the dependency.
- **Vuex:** in maintenance mode; Pinia is the official recommendation.
