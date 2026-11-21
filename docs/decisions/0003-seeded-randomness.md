# 0003. All randomness is seeded

**Status:** accepted

## Context

Horses, programs and races are random by design, which makes them hard to test,
debug and compare. A bug report saying "the fourth round looked wrong" is useless if
the round cannot be replayed.

## Decision

- Every random decision takes a `RandomSource` (`() => number`, same contract as
  `Math.random`). `Math.random` is not used anywhere.
- `createRandom(seed)` is mulberry32: tiny, fast, good statistical quality for gameplay.
- Each concern draws from its own stream, derived with `deriveSeed(seed, label…)`:
  horses, program #n, round #i of program #n. Adding a random call in one place never
  shifts the numbers somewhere else.
- The session seed comes from `?seed=<number>` or is generated, and is shown in the footer.
  Programs are numbered within a session, so the footer's replay link carries both:
  `?seed=42&program=3` replays exactly the program on screen.

## Consequences

- Any program of any session can be replayed by URL; tests and screenshots are deterministic.
- Unit tests assert real outcomes for fixed seeds instead of mocking randomness.
- mulberry32 is not cryptographically secure, which is irrelevant here.
