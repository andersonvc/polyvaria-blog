/*
  The fifteen alpha families that compose Polyvaria's signal surface.
  Counts and premise lines derived from the platform's signal library;
  worded for a public audience (no implementation detail or returns).
*/

export type Family = {
  name: string;
  premise: string;
  liveCount: number;       // implemented agents in this family
  candidateCount: number;  // researched, not currently weighted
  tags?: string[];
};

export const FAMILIES: Family[] = [
  {
    name: "Value",
    premise:
      "Firms cheap on accounting fundamentals tend to outperform across multi-quarter horizons.",
    liveCount: 6,
    candidateCount: 7,
    tags: ["fundamentals"],
  },
  {
    name: "Momentum",
    premise:
      "Recent relative winners persist over six- to twelve-month horizons through underreaction and flow.",
    liveCount: 4,
    candidateCount: 7,
    tags: ["price"],
  },
  {
    name: "Quality",
    premise:
      "High-margin, high-return-on-capital firms compound faster and are systematically underpriced.",
    liveCount: 5,
    candidateCount: 8,
    tags: ["fundamentals"],
  },
  {
    name: "Capital Discipline",
    premise:
      "Firms that invest aggressively tend to underperform the ones that reinvest with restraint.",
    liveCount: 3,
    candidateCount: 5,
    tags: ["fundamentals"],
  },
  {
    name: "Shareholder Yield",
    premise:
      "Cash returned to shareholders is a cleaner read on value than reported earnings.",
    liveCount: 2,
    candidateCount: 3,
    tags: ["fundamentals"],
  },
  {
    name: "Defensive",
    premise:
      "Low-volatility and low-beta names generate higher risk-adjusted returns than CAPM predicts.",
    liveCount: 4,
    candidateCount: 3,
    tags: ["risk"],
  },
  {
    name: "Reversal",
    premise:
      "Winners revert at short horizons and again at very long ones, for different reasons at each.",
    liveCount: 3,
    candidateCount: 2,
    tags: ["price"],
  },
  {
    name: "Liquidity",
    premise:
      "Harder-to-trade names earn a premium; the catch is staying executable at rebalance.",
    liveCount: 2,
    candidateCount: 5,
    tags: ["microstructure"],
  },
  {
    name: "Earnings & Events",
    premise:
      "Prices underreact to earnings surprises, and the drift persists for weeks after the print.",
    liveCount: 5,
    candidateCount: 5,
    tags: ["events"],
  },
  {
    name: "Sentiment",
    premise:
      "Aggregate beliefs in news and positioning data leak information not yet reflected in price.",
    liveCount: 3,
    candidateCount: 7,
    tags: ["nlp", "events"],
  },
  {
    name: "Macro",
    premise:
      "Cross-sectional returns are partly explained by exposure to rates, dollar, and oil regimes.",
    liveCount: 1,
    candidateCount: 5,
    tags: ["macro"],
  },
  {
    name: "Seasonal",
    premise:
      "Persistent calendar effects like turn-of-month and pre-announcement drift are small but additive.",
    liveCount: 0,
    candidateCount: 6,
    tags: ["calendar"],
  },
  {
    name: "Technical",
    premise:
      "A handful of chart patterns survive scrutiny, mostly as features in a meta-model rather than signals on their own.",
    liveCount: 1,
    candidateCount: 5,
    tags: ["price"],
  },
  {
    name: "Alternative Data",
    premise:
      "Data from outside the filing cycle shows demand shifts before they reach reported numbers.",
    liveCount: 1,
    candidateCount: 7,
    tags: ["alt-data"],
  },
  {
    name: "Composite",
    premise:
      "Blends across families spread factor-timing risk that any single sleeve would concentrate.",
    liveCount: 2,
    candidateCount: 7,
    tags: ["meta"],
  },
];
