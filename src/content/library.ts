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
    liveCount: 5,
    candidateCount: 8,
    tags: ["fundamentals"],
  },
  {
    name: "Momentum",
    premise:
      "Recent relative winners persist over six- to twelve-month horizons through underreaction and flow.",
    liveCount: 3,
    candidateCount: 8,
    tags: ["price"],
  },
  {
    name: "Quality",
    premise:
      "High-margin, high-return-on-capital firms compound faster and are systematically underpriced.",
    liveCount: 4,
    candidateCount: 9,
    tags: ["fundamentals"],
  },
  {
    name: "Capital Discipline",
    premise:
      "Aggressive investing firms tend to underperform; conservative reinvesters earn a premium.",
    liveCount: 2,
    candidateCount: 6,
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
    liveCount: 3,
    candidateCount: 4,
    tags: ["risk"],
  },
  {
    name: "Reversal",
    premise:
      "Short-horizon and very long-horizon winners revert — distinct mechanisms across distinct windows.",
    liveCount: 2,
    candidateCount: 3,
    tags: ["price"],
  },
  {
    name: "Liquidity",
    premise:
      "Harder-to-trade names earn a premium; the long leg must be filtered for executability.",
    liveCount: 1,
    candidateCount: 6,
    tags: ["microstructure"],
  },
  {
    name: "Earnings & Events",
    premise:
      "Prices underreact to earnings surprises; the drift is extractable over a window of weeks.",
    liveCount: 4,
    candidateCount: 6,
    tags: ["events"],
  },
  {
    name: "Sentiment",
    premise:
      "Aggregate beliefs in news and positioning data leak information not yet reflected in price.",
    liveCount: 2,
    candidateCount: 8,
    tags: ["nlp", "events"],
  },
  {
    name: "Macro",
    premise:
      "Cross-sectional returns are partly explained by exposure to rates, dollar, and oil regimes.",
    liveCount: 0,
    candidateCount: 6,
    tags: ["macro"],
  },
  {
    name: "Seasonal",
    premise:
      "Persistent calendar effects — turn-of-month, pre-announcement drift — are small but additive.",
    liveCount: 0,
    candidateCount: 6,
    tags: ["calendar"],
  },
  {
    name: "Technical",
    premise:
      "A handful of chart patterns survive scrutiny; useful as features in a meta-model.",
    liveCount: 0,
    candidateCount: 6,
    tags: ["price"],
  },
  {
    name: "Alternative Data",
    premise:
      "Orthogonal data sources reveal demand and fundamentals ahead of financial reporting.",
    liveCount: 0,
    candidateCount: 8,
    tags: ["alt-data"],
  },
  {
    name: "Composite",
    premise:
      "Blended sleeves diversify factor-timing risk and stabilize what any single signal can deliver.",
    liveCount: 2,
    candidateCount: 7,
    tags: ["meta"],
  },
];
