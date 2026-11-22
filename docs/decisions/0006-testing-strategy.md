# 0006. Testing strategy

**Status:** accepted

## Decision

A pyramid, all of it deterministic thanks to seeds:

| Level     | Tool                          | What it proves                                                   |
| --------- | ----------------------------- | ---------------------------------------------------------------- |
| Unit      | Vitest                        | Domain rules, engine properties, status matrix, stores, clock    |
| Component | Vitest + Vue Test Utils       | Components render store state and dispatch the right actions     |
| E2E       | Playwright                    | The full flow in a real browser: generate, start, pause, results |
| Visual    | Playwright `toHaveScreenshot` | Layout regressions, with a fixed seed and a frozen clock         |

- Tests named `rule: …` map one-to-one to the rules in the brief.
- The engine is tested by properties (monotonic movement, finish exactly at finish time,
  frame-rate independence, finished horses always rank ahead) and statistically
  (condition matters, luck still plays a part).
- Visual baselines are committed (`e2e/__screenshots__/`) and generated in the official
  Playwright Docker image, the same Linux environment CI uses, so fonts and
  anti-aliasing match (`npm run test:visual:update:docker`).
- Coverage has a floor in `vitest.config.ts`; CI fails if it drops.

## Consequences

- Refactoring the UI does not break domain tests; changing rules breaks exactly the
  tests named after them.
- Screenshots must be regenerated (`npm run test:visual:update:docker`) when the design changes on purpose.
