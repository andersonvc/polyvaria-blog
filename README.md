# Polyvaria — public homepage

The investor / public-facing homepage for Polyvaria, positioning the platform
as a multi-agent quantitative portfolio fund. Static site, no SSR.

Sibling to `../ui/` (the operational dashboard). This package builds to a
folder of static HTML / CSS / JS that can be deployed to any static host
(Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, GitHub Pages).

## Run

```sh
npm install
npm run dev          # http://localhost:5180
```

## Build

```sh
npm run build        # outputs to ./dist
npm run preview      # serves the build for a smoke check
```

Production build is intentionally tiny: ~9.5 KB of JS, ~16 KB of CSS,
~16 KB of HTML (gzipped: ~4 KB / ~4 KB / ~4 KB). Zero runtime npm
dependencies. The only third-party resource is Google Fonts
(Source Serif 4, Inter, IBM Plex Mono) which is preconnected.

## Page anatomy

Single long-scroll page, five anchored sections:

| Anchor       | Section     | Purpose                                                  |
| ------------ | ----------- | -------------------------------------------------------- |
| `#top`       | Hero        | Wordmark + tagline + drifting signal-constellation canvas |
| `#thesis`    | Thesis      | The "edge through composition" intellectual position      |
| `#approach`  | Approach    | Six-stage pipeline flow (universe → execution)            |
| `#library`   | Library     | Bento grid of 15 alpha families                           |
| `#principles`| Principles  | Four architectural commitments                            |
| `#platform`  | Platform    | The technical stack as a typeset definition list          |

## Design language

| Token             | Value          | Role                       |
| ----------------- | -------------- | -------------------------- |
| `--ink-1`         | `#0b0d12`      | Page background            |
| `--cream-1`       | `#ECE7DC`      | Primary body text          |
| `--copper-1`      | `#C9A36B`      | Single accent — warm copper |
| `--font-display`  | Source Serif 4 | Headlines, display serif   |
| `--font-sans`     | Inter          | Body sans                  |
| `--font-mono`     | IBM Plex Mono  | Eyebrows, data labels      |

Native scroll throughout — no smooth-scroll dependency. Reduced-motion
users get a single static hero frame, instant reveals. The hero canvas
freezes when the tab is hidden.

## File layout

```
webpage/
├── index.html                  ← page shell (semantic sections, nav, footer)
├── public/
│   └── favicon.svg
├── src/
│   ├── main.ts                 ← entry; wires modules
│   ├── styles/
│   │   ├── tokens.css          ← design tokens (color, type, spacing, motion)
│   │   ├── base.css            ← reset + nav + footer + reveal primitive
│   │   └── sections.css        ← per-section layout
│   ├── modules/
│   │   ├── constellation.ts    ← hero canvas particle network
│   │   ├── library.ts          ← renders bento tiles from content
│   │   ├── nav.ts              ← sticky nav + active-section tracking
│   │   └── reveal.ts           ← IntersectionObserver fade-in
│   └── content/
│       └── library.ts          ← the 15 alpha families (one source of truth)
└── vite.config.ts
```

## Content guardrails

Per the brief:

- No claimed AUM, vintage, or founding date.
- No track record, Sharpe, or return numbers (illustrative or otherwise).
- No fundraising language — the page positions the platform, not a vehicle.
- Platform-first voice. The page describes what Polyvaria does, not who.
