/*
  Every hypothesis on the research record, by signal family and by
  what became of it: 120 signal cards, as catalogued by
  polyvaria-research on 23 October 2026.

  "book"     validated and used by a deployed blend
  "bench"    proposed, screened or validated, not yet in the book
  "rejected" tested and turned down
  "retired"  withdrawn after use
*/

export interface Family {
  name: string;
  book: number;
  bench: number;
  rejected: number;
  retired: number;
}

export const FAMILIES: Family[] = [
  { name: "Momentum", book: 5, bench: 2, rejected: 2, retired: 1 },
  { name: "Events and news", book: 0, bench: 7, rejected: 3, retired: 0 },
  { name: "Quality and profitability", book: 7, bench: 0, rejected: 2, retired: 0 },
  { name: "Composite mispricing", book: 5, bench: 1, rejected: 1, retired: 2 },
  { name: "Investment and issuance", book: 5, bench: 3, rejected: 0, retired: 0 },
  { name: "Analyst revisions", book: 0, bench: 5, rejected: 2, retired: 0 },
  { name: "Insider flow", book: 1, bench: 5, rejected: 1, retired: 0 },
  { name: "Reversal", book: 1, bench: 3, rejected: 2, retired: 1 },
  { name: "Earnings drift", book: 5, bench: 0, rejected: 0, retired: 0 },
  { name: "Value", book: 3, bench: 1, rejected: 0, retired: 0 },
  { name: "Overnight and intraday", book: 0, bench: 3, rejected: 1, retired: 0 },
  { name: "Macro and rates", book: 0, bench: 1, rejected: 2, retired: 0 },
  { name: "Liquidity", book: 1, bench: 0, rejected: 1, retired: 0 },
  { name: "Distress", book: 1, bench: 0, rejected: 0, retired: 0 },
  { name: "Low risk", book: 0, bench: 0, rejected: 0, retired: 1 },
  { name: "Not yet filed", book: 0, bench: 24, rejected: 8, retired: 1 },
];

/** One rejected card, from its evidence and history. */
export const REJECTED_CARD = [
  { k: "signal", v: "insider_grade_consensus" },
  { k: "family", v: "insider flow" },
  { k: "first screen", v: "25 June 2026 · IC t-stat +3.04" },
  { k: "full history", v: "12 July 2026 · IC t-stat +0.12 · 0 of 3 regimes" },
  { k: "finding", v: "the first read was a 77-name biased subsample" },
  { k: "disposition", v: "rejected · dropped from the book", flag: true },
] as const;
