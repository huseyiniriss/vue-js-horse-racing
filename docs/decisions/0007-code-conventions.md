# 0007. Code conventions

**Status:** accepted

Conventions only matter if they are applied without thinking, so most of these are
enforced by tooling. `npm run check` runs all of it; CI fails on any warning.

## Tooling owns the boring parts

- **Prettier** owns formatting (no semicolons, single quotes, 100 columns). Never argue
  about formatting in review.
- **ESLint** (`vue/flat/recommended` + `typescript-eslint` strict type-checked + project
  rules) owns correctness and conventions, with `--max-warnings 0`.
- **TypeScript** is strict, plus `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`. `switch` over a union must be exhaustive.

## Naming

| Kind              | Convention                                    | Example               |
| ----------------- | --------------------------------------------- | --------------------- |
| TS modules        | kebab-case                                    | `race-engine.ts`      |
| Vue components    | PascalCase, at least two words                | `RaceTrack.vue`       |
| Composables       | `use` + PascalCase                            | `useRaceClock.ts`     |
| Stores            | `<name>.store.ts`, exporting `use<Name>Store` | `race.store.ts`       |
| Rules / config    | `<name>.rules.ts`, `<name>.timing.ts`         | `race.rules.ts`       |
| Tests             | next to the code, `<file>.spec.ts`            | `race-engine.spec.ts` |
| Types, interfaces | PascalCase, no `I` prefix                     | `RoundResult`         |
| Config constants  | SCREAMING_SNAKE_CASE                          | `RACE_RULES`          |
| Booleans          | `is` / `has` / `can` prefix                   | `canGenerate`         |

## Architecture

- Dependencies point one way: `components → store → domain`, `features → shared`.
  The boundaries in [0001](0001-feature-based-structure.md) are lint errors.
- **Domain** is pure TypeScript: no Vue, no I/O, no `Math.random`, no `Date.now`.
  Randomness and time are passed in.
- **Stores** orchestrate the domain and hold state. State changes only through actions.
- **Components** render state and call actions. Anything non-trivial in a template moves
  to a `computed`; anything reusable moves to the domain or a composable.
- `shared/ui` components are presentational: props in, events out, no store access.
- Cross-folder imports use the `@/` alias; imports inside a feature are relative.
  Type-only imports use `import type` (lint-enforced).

## Vue

- `<script setup lang="ts">` only; block order `script → template → style`.
- Typed `defineProps<…>()` / `defineEmits<…>()`; props down, events up.
- Stable `:key`s (ids, never array indexes for reorderable lists).
- Styles are scoped and use design tokens (`shared/styles/tokens.css`): no raw colors,
  sizes or durations in components.
- User-facing text lives in each feature's `copy.ts`, so wording changes (or i18n) touch
  one file per feature.

## Errors

- Programmer errors (invalid ranges, illegal state transitions, unknown ids) throw
  immediately with a message that names the bad value.
- The UI prevents illegal actions (disabled buttons with a reason) instead of catching errors.

## Comments

- Explain _why_, not _what_. Public domain functions get a short doc comment when the
  name alone is not enough.

## Accessibility

- Semantic elements first (`button`, `table`, `ol`), visible keyboard focus, `aria-live`
  for results, `prefers-reduced-motion` respected, WCAG AA contrast.

## Git

- [Conventional Commits](https://www.conventionalcommits.org/) with the feature as scope:
  `feat(race): …`, `fix(horses): …`, `test(e2e): …`, `docs: …`, `chore: …`.
- Small commits that each leave the tree green.
