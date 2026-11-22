# 0008. Horses from Muybridge's gallop, identified by silks

**Status:** accepted

## Context

The brief asks for 20 horses with unique colors that visibly move. Most solutions color a
static icon or emoji, which reads as a toy and does not actually gallop.

## Decision

- **The figure** is traced from Eadweard Muybridge's _The Horse in Motion_ (1878, public
  domain): 15 frames of a real gallop. `scripts/build-gallop-sprites.mjs` turns the traced
  frames (`scripts/data/muybridge-gallop.json`) into three static sprite files (horse, breeches, jockey) and a tiny
  meta module (`npm run sprites`).
- **Rendering** uses the sprites as CSS masks: one layer paints the horse in a dark bay,
  a second paints the jockey's white breeches, a third the jockey in the horse's color. Each layer runs the same
  `steps()` animation, so they stay in sync; lanes are phase-shifted so the field does not
  stride in lockstep. No per-frame JavaScript.
- **Identity** follows racing: the horse's unique color is its **silks**. Each horse also
  gets one of ten registered silks patterns (seeded) with a trim picked for WCAG contrast.
  Lists show a silks icon; the track shows the jockey in the silks color.
- Colors come from Kelly's 22 colors of maximum contrast minus white and black, so all 20 stay distinguishable.

## Consequences

- Authentic motion at the cost of ~110 KB of cached SVG (19 KB gzipped each sprite).
- The traced silhouettes do not separate the jockey's legs from the horse. Extracting
  them from the photo pixels flickered, so the white breeches are drawn instead: a bent
  hip → knee → stirrup stroke placed from each frame's jockey box (a third sprite layer).
- Reduced motion freezes the gallop on one frame without hiding any information.
