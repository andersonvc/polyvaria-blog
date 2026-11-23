/*
  Parameters as deployed in the polyvaria repository on 21 November
  2026: the referee's ScoringConfig defaults, deploy/config/risk-run,
  deploy/config/decision, and the engine's test oracle.
*/

export interface ParameterGroup {
  group: string;
  /** `value` is rendered as HTML so that exponents can be set as superiors */
  rows: Array<{ name: string; value: string }>;
}

export const PARAMETERS: ParameterGroup[] = [
  {
    group: "Referee",
    rows: [
      { name: "Cross-validation", value: "combinatorial purged, 6 groups with 2 held out: 15 splits" },
      { name: "Purge and embargo", value: "at least 21 bars purged, 10 bars embargoed" },
      { name: "Acceptance", value: "deflated Sharpe probability ≥ 0.95 and probability of backtest overfitting ≤ 0.5" },
      { name: "Scoring costs", value: "1 bp commission plus square-root impact; fills at the next open, one bar late" },
      { name: "Tripwires", value: "future corruption, planted column, declared lookback; tolerance 10<sup>−8</sup>" },
      { name: "Sandbox", value: "no network, no capabilities, cleared environment, read-only root, fresh per request" },
      { name: "Signature", value: "ECDSA P-256 over SHA-256" },
      { name: "Service limits", value: "4 concurrent runs, 6 hours each" },
    ],
  },
  {
    group: "Risk model",
    rows: [
      { name: "Factors", value: "market, 7 styles, 31 industry groups" },
      { name: "Styles", value: "size, book-to-market, momentum, leverage, residual volatility, beta, earnings quality" },
      { name: "Estimation", value: "daily cross-sectional regression, weighted by the square root of capitalisation" },
      { name: "Estimation universe", value: "capitalisation ≥ $2 bn, price ≥ $5, largest 1,500 names" },
      { name: "Covariance", value: "volatility half-life 84 days, correlation half-life 504 days" },
      { name: "Corrections", value: "Newey–West, eigenfactor adjustment over 1,000 simulations, volatility-regime adjustment" },
    ],
  },
  {
    group: "Solve",
    rows: [
      { name: "Solver", value: "CVXPY with Clarabel, tolerances 10<sup>−7</sup>" },
      { name: "Name cap", value: "the larger of 5% and benchmark weight plus 2%" },
      { name: "Turnover", value: "buys plus sells ≤ 30% per rebalance; each ≤ 20% per day" },
      { name: "Bands against the benchmark", value: "style exposure ±0.30, industry weight ±5%, predicted beta 0.95 to 1.05" },
      { name: "No-trade band", value: "0.25%" },
      { name: "Plan identifier", value: "SHA-256 of the pre-trade book, configuration, date and producing commit" },
    ],
  },
  {
    group: "Execution",
    rows: [
      { name: "Urgency", value: "0.45 alpha rank, 0.30 risk removed, 0.25 size of the change; damped by participation" },
      { name: "Order styles", value: "passive limit, limit at mid, marketable limit, market" },
      { name: "Schedule", value: "up to 12 waves; target participation 1% to 20%" },
      { name: "Cost model", value: "5 bp plus 0.5 × daily volatility × √(notional ÷ average volume), capped at 5%" },
    ],
  },
  {
    group: "Numerics",
    rows: [
      { name: "Test oracle", value: "relative 10<sup>−9</sup>, absolute 10<sup>−12</sup>" },
      { name: "Determinism", value: "injected clock, explicit seeds; no wall clock, no unseeded generator" },
    ],
  },
];
