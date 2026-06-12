# Polyvaria brand assets

## The mark — a constraint polytope

In constrained portfolio optimization, the set of feasible books is a convex
polytope: every sector cap, single-name limit, and turnover bound cuts a face.
The solve lands on that polytope's boundary — at a vertex where constraints
bind. The Polyvaria mark is that object: a faceted convex solid drawn as a
wireframe, with the optimal vertex set in copper and its two binding edges
brightened.

*Poly* (many) / *varia* (variants): many signals, many strategies, one
feasible book. The hero animation on the homepage is the same solid in slow
rotation, so the site and the mark read as one identity.

## Files

| File                          | Use                                            |
| ----------------------------- | ---------------------------------------------- |
| `polyvaria-mark.svg`          | Symbol only, dark backgrounds                  |
| `polyvaria-mark-light.svg`    | Symbol only, light backgrounds                 |
| `polyvaria-lockup.svg`        | Symbol + wordmark, dark backgrounds            |
| `polyvaria-lockup-light.svg`  | Symbol + wordmark, light backgrounds           |
| `polyvaria-wordmark.svg`      | Wordmark only, dark backgrounds                |
| `polyvaria-wordmark-light.svg`| Wordmark only, light backgrounds               |
| `og.png`                      | Social share card (2400×1260, 2× of 1200×630)  |
| `apple-touch-icon.png`        | iOS home-screen icon (180×180)                 |
| `../favicon.svg`              | Favicon variant — heavier strokes for 16–32 px |

The wordmark is set in Source Serif 4 (`opsz 36 / wght 560`) and is fully
outlined — the SVGs render identically with no fonts installed.

## Rules of thumb

- Wordmark color is cream `#ECE7DC` on dark, ink `#14161D` on light; the
  symbol's accent stays copper (`#C9A36B` family) in both.
- Clear space: half the symbol's height on all sides.
- Below ~24 px of height, prefer the favicon variant of the symbol; the
  display mark's hairlines are tuned for 32 px and up.
- Don't recolor the optimal vertex, outline the wordmark, or rotate the
  static mark. The only thing that rotates is the hero animation.
