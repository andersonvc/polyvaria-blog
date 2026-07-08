/*
  The thirteen alpha families that compose Polyvaria's signal surface.
  Live counts follow the platform's derived-signal registry; candidate
  counts follow the research library's documented hypothesis cache.
  Worded for a public audience (no implementation detail or returns).
*/

export type Family = {
  name: string;
  premise: string;
  liveCount: number;       // signals in the production registry
  candidateCount: number;  // documented hypotheses, not currently weighted
  tags?: string[];
};

export const FAMILIES: Family[] = [
  {
    name: "Value",
    premise:
      "Firms cheap on accounting fundamentals outperform over multi-quarter horizons; the sleeve leans on cash-flow yields, where the premium has stayed durable.",
    liveCount: 4,
    candidateCount: 20,
    tags: ["fundamentals"],
  },
  {
    name: "Momentum",
    premise:
      "Recent relative winners persist over six- to twelve-month horizons; the sleeve spans classic, intermediate, residual, and industry-relative forms.",
    liveCount: 6,
    candidateCount: 24,
    tags: ["price"],
  },
  {
    name: "Quality",
    premise:
      "High-profitability firms compound faster than the market prices in; cash-based measures screen out the accrual noise.",
    liveCount: 6,
    candidateCount: 28,
    tags: ["fundamentals"],
  },
  {
    name: "Capital Discipline",
    premise:
      "Firms that invest aggressively tend to underperform the ones that reinvest with restraint.",
    liveCount: 4,
    candidateCount: 18,
    tags: ["fundamentals"],
  },
  {
    name: "Shareholder Yield",
    premise:
      "Cash returned through dividends and net buybacks is a cleaner read on value than reported earnings.",
    liveCount: 2,
    candidateCount: 8,
    tags: ["fundamentals"],
  },
  {
    name: "Defensive",
    premise:
      "Low-volatility names earn better risk-adjusted returns than CAPM says they should.",
    liveCount: 2,
    candidateCount: 12,
    tags: ["risk"],
  },
  {
    name: "Reversal",
    premise:
      "Short-horizon losers bounce; the clean version strips factor moves first and skips earnings windows entirely.",
    liveCount: 4,
    candidateCount: 14,
    tags: ["price"],
  },
  {
    name: "Liquidity",
    premise:
      "Harder-to-trade names earn a premium; the catch is staying executable at rebalance.",
    liveCount: 1,
    candidateCount: 10,
    tags: ["microstructure"],
  },
  {
    name: "Earnings & Events",
    premise:
      "Prices underreact to earnings surprises, and the drift persists for weeks after the print.",
    liveCount: 6,
    candidateCount: 30,
    tags: ["events"],
  },
  {
    name: "Analyst & Sentiment",
    premise:
      "Estimate revisions, dispersion, rating actions, and news flow leak information before price fully carries it.",
    liveCount: 5,
    candidateCount: 26,
    tags: ["nlp", "events"],
  },
  {
    name: "Interaction & Composites",
    premise:
      "Signals conditioned on each other beat signals added together: momentum confirmed by earnings, cheapness gated by quality.",
    liveCount: 4,
    candidateCount: 41,
    tags: ["meta"],
  },
  {
    name: "Macro",
    premise:
      "Cross-sectional returns partly reflect exposure to rates and the curve; treated as conditioning, never as timing.",
    liveCount: 1,
    candidateCount: 12,
    tags: ["macro"],
  },
  {
    name: "Seasonal",
    premise:
      "Calendar effects are researched and, so far, documented dead. The graveyard keeps them from coming back.",
    liveCount: 0,
    candidateCount: 8,
    tags: ["calendar"],
  },
];
