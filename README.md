# Horse Racing

[![CI](https://github.com/huseyiniriss/vue-js-horse-racing/actions/workflows/ci.yml/badge.svg)](https://github.com/huseyiniriss/vue-js-horse-racing/actions/workflows/ci.yml)

An interactive horse racing game built with **Vue 3, TypeScript and Pinia**. Generate a
race program, start it, and watch six rounds run one after another, with results arriving
as each round finishes.

**Live demo:** https://vue-js-horse-racing.vercel.app

![Race day, round 3 paused: the stable, the track with the photo finish of round 2, the program and results](docs/screenshot.png)

## How to play

1. **Generate program** draws six rounds of ten horses each from the stable of 20.
2. **Start** runs the rounds one at a time. **Pause** freezes every horse where it is;
   **Resume** carries on from the same frame.
3. Each result appears in **Results** the moment its round finishes, followed by a photo
   finish of the field.
4. When all six rounds are done, generate a new program and race again.

The footer shows the session's seed. **Replay this race day** opens the same horses and
the same program, so any race can be watched again exactly as it ran.

## The brief, mapped to the code

| The brief asks for                                       | Where it lives                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| 20 horses, each with a unique color and condition 1–100  | `features/horses/domain/generate-horses.ts`, `horse-palette.ts` |
| Generate: 6 rounds, 10 random horses from the 20 each    | `features/race/domain/schedule.ts`, `race.rules.ts`             |
| Distances 1200, 1400, 1600, 1800, 2000, 2200 m, in order | `features/race/domain/race.rules.ts`                            |
| Start / Pause, rounds run one at a time                  | `features/race/store/race.store.ts`, `domain/race-status.ts`    |
| Horses move on the track                                 | `features/race/components/RaceTrack.vue`, `TrackLane.vue`       |
| Results per round, in the Results panel                  | `features/race/components/ResultsPanel.vue`                     |
| Horse list, program and results side by side             | `app/App.vue`, `HorseList.vue`, `ProgramPanel.vue`              |
| Pinia for state, component-based design                  | `features/*/store`, `features/*/components`                     |
| Bonus: unit, E2E and visual tests                        | `src/**/*.spec.ts`, `e2e/`                                      |

Each rule of the brief has a unit test named after it (`rule: …`), so breaking a rule
fails exactly the test that describes it.

## Beyond the brief

Small, self-contained additions; removing any of them leaves the core untouched.

- **Real gallop.** The horses are traced from Eadweard Muybridge's _The Horse in Motion_
  (1878) and animated as CSS sprites, with jockeys in their horse's silks.
- **Broadcast-style track** with starting stalls, distance markers and a winning post.
- **Photo finish** after every round, drawn from the same finish times as the result.
- **Replayable sessions** from a seed in the URL (`?seed=42&program=3`).
- **Accessible:** responsive from phone to desktop, keyboard operable, race commentary
  for screen readers, reduced-motion support, and an axe check in the E2E suite.

## Quick start

Requires Node 22 (see `.nvmrc`).

```sh
npm ci
npm run dev          # http://localhost:5173
```

| Script                              | What it does                                            |
| ----------------------------------- | ------------------------------------------------------- |
| `npm run dev`                       | Development server                                      |
| `npm run build`                     | Type-check and production build                         |
| `npm run check`                     | Format check, lint, type-check and unit tests (CI gate) |
| `npm run test:unit`                 | Unit and component tests (Vitest)                       |
| `npm run test:coverage`             | Unit tests with coverage (enforced floor)               |
| `npm run test:e2e`                  | E2E and accessibility tests (Playwright)                |
| `npm run test:visual:docker`        | Visual regression tests in the CI Playwright image      |
| `npm run test:visual:update:docker` | Regenerate the visual baselines                         |
| `npm run sprites`                   | Rebuild the gallop sprites from the traced frames       |

Visual baselines are platform-specific, so they are generated and checked inside the
official Playwright Docker image, the same one CI uses. The `:docker` scripts need Docker.

## Architecture

```
src/
  app/          composition root: bootstraps stores from the URL seed, lays out the screen
  features/
    horses/     the stable: horse generation, silks, horses store, horse list, gallop figure
    race/       program, race engine, status machine, race store, clock, track and panels
  shared/       feature-agnostic: seeded random, ticker, formatters, tokens, UI primitives
```

- **Feature-based structure with enforced boundaries.** A feature is used only through
  its `index.ts`; `domain/` code is framework-free; `shared/` never imports features.
  ESLint fails the build otherwise.
- **The race is decided up front, then played back.** When a round starts, the engine
  gives every horse a pace per track segment (condition, form and luck). Finishing order
  and the position at any moment are pure functions of time, so what you see is the
  result, at any frame rate, and pause/resume is exact.
- **Explicit status machine** (`idle → ready → running ⇄ paused → finished`) drives both
  the store actions and the buttons. Generate is disabled while a race is in progress.
- **One clock.** A `requestAnimationFrame` ticker advances one piece of state per frame;
  horses move by CSS transforms.

The reasoning, alternatives and trade-offs are in the
[architecture decision records](docs/decisions/README.md); the visual language is in the
[design system](docs/design-system.md).

## Testing

| Level     | Tool                          | Covers                                                          |
| --------- | ----------------------------- | --------------------------------------------------------------- |
| Unit      | Vitest                        | Rules of the brief, engine properties, status matrix, stores    |
| Component | Vitest + Vue Test Utils       | Controls, track, program, results, photo finish, announcer      |
| E2E       | Playwright (desktop + mobile) | Generate, start, pause/resume, full race day, replay, axe check |
| Visual    | Playwright screenshots        | Idle, ready, paused and finished states with a frozen clock     |

Everything runs from a fixed seed and a controlled clock, so results are deterministic.
CI runs the quality gate first, then the E2E, accessibility and visual tests.

## Assumptions

The brief leaves a few points open; these are the choices made:

1. The game always has 20 horses; "a list of 1–20 horses" is read as the size of the
   stable, which the rules fix at 20.
2. Condition makes a horse faster on average, but form and luck still matter: a much
   fitter horse almost always wins, a slightly fitter one only more often.
3. Condition stays the same for the whole session.
4. A horse can run in several rounds; each round draws 10 of the 20 independently.
5. Generate is disabled while a race is running or paused, so a click cannot wipe a race
   in progress.

## Credits

- Horse figures traced from Eadweard Muybridge, _The Horse in Motion_ (1878), public domain.
- Typeface: [Open Runde](https://github.com/lauridskern/open-runde), SIL Open Font License.
- Horse colors: Kenneth Kelly's 22 colors of maximum contrast (1965), without white and black.
- Horse names: pioneers of computing, following the example in the brief.
