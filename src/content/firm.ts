/*
  The firm, seat by seat: who does each job at a conventional fund,
  and the autonomous unit that does it at Polyvaria. The units are the
  platform's own subsystems (polyvaria: apps/, docs/ARCHITECTURE.md)
  and the research workspace's roles (polyvaria-research).
*/

export interface Unit {
  /** the people who hold this seat at a conventional fund */
  seat: string;
  unit: string;
  does: string;
  /** the one seat still held by people */
  human?: boolean;
}

export const UNITS: Unit[] = [
  {
    seat: "Head of research",
    unit: "Principal investigator",
    does: "Runs the research book. Turns a weakness in the portfolio into funded research, moves compute toward the lines producing evidence and retires the ones that stall.",
  },
  {
    seat: "Researchers and analysts",
    unit: "Research pods",
    does: "One pod to a signal family. Each takes a hypothesis from idea to working signal against the shared backtester, and submits what survives.",
  },
  {
    seat: "Data engineers and data scientists",
    unit: "Data",
    does: "Owns the lake: 151 datasets, sixteen years deep, every row stamped with the moment it was learned. Writes the ingestion for new data when research asks for it.",
  },
  {
    seat: "Risk managers",
    unit: "Risk",
    does: "Re-estimates a Barra-grade factor model every trading day and publishes nothing on a day the estimate fails its own gate.",
  },
  {
    seat: "Portfolio managers",
    unit: "Portfolio",
    does: "Reconciles the book each morning, then solves for the day’s trades inside hard limits. Every plan can be replayed exactly.",
  },
  {
    seat: "Traders",
    unit: "Execution",
    does: "Works the trade list in thirteen waves a session, pricing each order by how urgent it is and what it will cost.",
  },
  {
    seat: "Model validation and the investment committee",
    unit: "The referee",
    does: "Runs every candidate in a sandbox, recomputes its results from scratch and signs the verdict. Belongs to no pod and takes no one’s word.",
  },
  {
    seat: "Platform engineering",
    unit: "Every unit, for itself",
    does: "Each unit writes, tests and maintains its own code. There is no separate engineering organisation for anyone to wait on.",
  },
  {
    seat: "Principals",
    unit: "People",
    does: "Set the mandate, the risk budgets and the thresholds of the gates. Hold the halt.",
    human: true,
  },
];

/** The daily line: one path from data to orders. */
export const LINE = [
  {
    name: "Universe",
    lead: "Point-in-time by construction.",
    text: "About 2,400 tradable names, rebuilt for every date back to 2010 with delisted companies included, so a backtest never sees a stock the book could not have traded.",
    out: "universe",
  },
  {
    name: "Signals",
    lead: "73 in the library.",
    text: "Price, fundamental, event, analyst and news data worked into cross-sectional rankings. Fundamentals enter as first filed, never as later revised.",
    out: "alpha ranks",
  },
  {
    name: "Model",
    lead: "One unified score.",
    text: "Gradient-boosted trees blend the signal panel into a single six-month forecast, served from a frozen payload whose every byte is hashed.",
    out: "alpha score",
  },
  {
    name: "Risk",
    lead: "Estimated daily.",
    text: "Market, seven styles and 31 industry groups, corrected for serial correlation, for the optimizer’s taste for badly estimated bets, and for volatility regimes.",
    out: "factor covariance",
  },
  {
    name: "Optimizer",
    lead: "A constrained conic programme.",
    text: "Maximises expected return net of active risk and trading cost, inside limits that are part of the solve itself. A book that breaks them cannot come out.",
    out: "rebalance plan",
  },
  {
    name: "Execution",
    lead: "Every order knows its urgency.",
    text: "Patient limit orders where the edge is slow, marketable ones where it is dying, sliced into waves behind a spread-and-impact cost model.",
    out: "fills",
  },
] as const;

/** The research loop, clockwise from the top. */
export const LOOP = [
  { name: "Sense", by: "The platform", text: ["Decay, crowding and gaps", "become draft mandates."] },
  { name: "Allocate", by: "Principal investigator", text: ["Compute is capital. Themes", "earn it with evidence."] },
  { name: "Generate", by: "Research pods", text: ["Pods recombine ideas, and", "check the dead ones first."] },
  { name: "Build", by: "Research pods", text: ["Candidates are built against", "point-in-time data."] },
  { name: "Verify", by: "The referee", text: ["Recomputed in a sandbox,", "judged, and signed."] },
  { name: "Deploy", by: "The book", text: ["Survivors start small and", "earn their weight."] },
] as const;
