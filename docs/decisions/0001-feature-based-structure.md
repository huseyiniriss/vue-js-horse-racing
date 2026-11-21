# 0001. Feature-based structure with enforced boundaries

**Status:** accepted

## Context

The brief asks for code organised "as if for a large-scale project". Layer-based
folders (`components/`, `stores/`, `utils/`) are fine at ten files and turn into a
junk drawer at two hundred: everything related to one feature is spread over the tree.

## Decision

Organise by feature, with a small shared kernel:

```
src/
  app/        composition root: bootstraps stores, lays out the screen
  features/
    horses/   the stable: horse generation, horses store, horse list
    race/     program, race engine, race store, clock, track and panels
  shared/     feature-agnostic code: random source, ticker, UI primitives, styles
```

Inside a feature: `domain/` (framework-free TypeScript), `store/`, `composables/`,
`components/`, and an `index.ts` that is the feature's public API.

Rules, enforced by ESLint (`no-restricted-imports` in `eslint.config.mjs`):

- A feature imports another feature only through `@/features/<name>`.
- `domain/` never imports Vue, Pinia, or its own UI/state layers.
- `shared/` never imports features or the app shell.
- Features never import the app shell.

## Consequences

- A feature can be read, tested and owned in isolation; the dependency graph stays acyclic
  (`race → horses → shared`).
- The boundaries are cheap to keep because the linter keeps them.
- Moving a feature into its own package (or a micro-frontend, if a team ever needs one)
  starts from a clean seam instead of a refactor.

## Alternatives considered

- **Layer-based folders:** simpler at first, but couples unrelated features through shared folders.
- **Micro-frontends / monorepo packages:** real costs (build, versioning, runtime integration)
  with no benefit at this size.
- **eslint-plugin-boundaries:** more expressive, but the built-in rule covers our four rules
  with zero extra dependencies.
