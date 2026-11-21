# Design system

A small, purpose-built system for a race day screen. Everything visual comes from
tokens in [`src/shared/styles/tokens.css`](../src/shared/styles/tokens.css); components
never use raw colors, sizes or durations ([ADR 0007](decisions/0007-code-conventions.md)).

## Direction

**A racecourse on race day.** Broadcast-style track (turf mowing bands, aluminium
starting stalls, a white running rail, distance markers and a winning post with its red
disc), a printed racecard for the panels, and jockey silks as the way horses are
recognised. One memorable moment: the **photo-finish print** after each round.

Restraint rules:

- One hero (the track and its photo finish); panels stay quiet.
- Color comes from the horses' silks. The interface itself is green, ink and paper.
- Motion only where it carries meaning: the gallop, gates opening, a result arriving,
  the photo print developing.

## Tokens

| Group      | Tokens (examples)                                                         | Notes                                                         |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Surfaces   | `--color-paper`, `--color-surface`, `--color-surface-sunken`, `--color-line` | Light, cool paper. No cream, no near-black chrome.            |
| Text       | `--color-ink`, `--color-ink-muted`, `--color-ink-inverse`                 | Ink on surface ≥ 12:1, muted ≥ 5.5:1.                          |
| Track      | `--color-turf`, `--color-turf-stripe`, `--turf-grain`, `--color-rail`, `--color-pole` | Mowing bands + fine grain; white rail; red winning-post disc. |
| Stalls     | `--color-stall*`, `--color-plate`, `--color-gate`                         | Brushed aluminium, black number plates.                       |
| Horses     | `--color-horse`, `--color-breeches`, `--color-horse-shadow`               | Dark bay horse, white breeches; silks color comes from data.  |
| Actions    | `--color-action*`, `--color-secondary-depth`, `--color-focus`             | Deep turf green primary; blue focus ring (3px).               |
| Podium     | `--color-gold/silver/bronze` (badges), `--color-*-text` (text on white)   | Text variants pass WCAG AA.                                   |
| Type       | `--font-family` (Open Runde), `--font-size-xs…2xl`, weights 400–700       | 1.25 modular scale, tabular numerals everywhere.              |
| Space      | `--space-1…7`                                                             | 4px grid.                                                     |
| Shape      | `--radius-sm/md`, `--border-width`, `--button-depth`, `--button-press`    | Square-ish racecard corners; tactile button depth.            |
| Layout     | `--panel-width`, `--lane-height`, `--runner-width`, `--gate-width`, `--control-min-size` | Lanes and runners grow on desktop.                 |
| Motion     | `--duration-instant/fast/base/gate/develop/gallop`, `--ease-out/in-out`   | All durations collapse to 0 under `prefers-reduced-motion`.   |

## Components

| Component        | Where                     | Responsibility                                                       |
| ---------------- | ------------------------- | -------------------------------------------------------------------- |
| `AppButton`      | `shared/ui`               | Tactile button, `primary` / `secondary`; hover, focus, pressed, disabled. |
| `PanelSection`   | `shared/ui`               | Racecard panel: heavy top rule, title, meta slot, keyboard-scrollable body. |
| `HorseFigure`    | `features/horses`         | Muybridge gallop: horse, breeches and silks layers, one `steps()` animation each. |
| `SilksIcon`      | `features/horses`         | Jockey jacket and cap in one of ten registered patterns.            |
| `HorseLabel`     | `features/horses`         | Silks + name, truncates with an ellipsis.                            |
| `HorseList`      | `features/horses`         | The stable: horse, condition meter.                                  |
| `RaceTrack`      | `features/race`           | Header, rail, lanes, finish line, photo finish.                      |
| `TrackLane`      | `features/race`           | Starting stall, runner, finishing badge.                             |
| `SaddleCloth`    | `features/race`           | Numbered cloth, as on a racecard.                                    |
| `RoundTable`     | `features/race`           | One round of the program or results; sticky heading.                 |
| `PhotoFinish`    | `features/race`           | The finish-line camera print of the latest round.                    |
| `RaceControls`   | `features/race`           | Generate and Start/Pause/Resume, driven by the status machine.       |
| `RaceAnnouncer`  | `features/race`           | Visually hidden live region narrating the race.                      |

## Platform guidelines we follow

The game is a web app, so WCAG 2.2 is the baseline; the parts of Apple's Human
Interface Guidelines that apply to the web are adopted as rules:

- **Touch targets** are at least 44×44 px (`--control-min-size`).
- **Contrast:** text meets WCAG AA; silks trims are chosen for contrast; dark silks get a halo on the track.
- **Feedback:** every control has hover (pointer devices only), `:focus-visible`, pressed
  and disabled states; disabled Generate explains why (`aria-describedby`).
- **Motion:** meaningful and interruptible; `prefers-reduced-motion` removes the gallop,
  gate and print animations without hiding information.
- **Clarity:** one primary action at a time; the Start/Pause button names what it will do.
- **Semantics:** landmarks, heading order, real tables with header cells, lists for lanes
  and rounds, `figure` for the photo finish, a polite live region for results.
- **Responsive:** mobile first (track, results, program, stable), tablet (track over
  three panels), desktop (the case layout). No horizontal page scroll at 360 px.
