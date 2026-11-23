/*
  The firm as six distinct departments, and the path one hypothesis
  takes between them.

  Each department is its own body: a swarm of lights, one light for each
  agent, organising itself in its own way (lib/swarms.ts). They are
  separate, and they work together only by passing work across the
  space between them. The story below is the order in which that
  happens for a single hypothesis, from the idea to the book.

  Positions are fractions of the figure's box; radii are fractions of
  the box's shorter side. No DOM.
*/
import { type Style, type Swarm, swarm } from "./swarms";

export interface Department {
  id: string;
  name: string;
  /** centre, as a fraction of the box */
  x: number;
  y: number;
  /** radius, as a fraction of the box's shorter side */
  r: number;
  /** how its agents are organised: Research in pods, every other department as graphs run in sequence */
  style: Style;
  /** how many agents a pod formation has; a graph formation sets its own number */
  staff?: number;
  /** set the name over the department, where a path would otherwise run through it */
  above?: boolean;
}

/* Research sits in the middle. The others stand round it in an order that lets every path
   between two departments run without crossing another. */
export const DEPARTMENTS: Department[] = [
  { id: "onboarding", name: "Onboarding", x: 0.61, y: 0.18, r: 0.125, style: "dags", above: true },
  { id: "research", name: "Research", x: 0.41, y: 0.5, r: 0.172, style: "pods", staff: 760 },
  { id: "hds", name: "HDS / Backtesting", x: 0.2, y: 0.25, r: 0.125, style: "dags", above: true },
  { id: "risk", name: "Risk", x: 0.86, y: 0.48, r: 0.118, style: "dags" },
  { id: "portfolio", name: "Portfolio Management", x: 0.65, y: 0.81, r: 0.125, style: "dags" },
  { id: "execution", name: "Execution", x: 0.22, y: 0.81, r: 0.118, style: "dags" },
];

/** A department's swarm, in its starting formation. */
export const swarmOf = (d: number): Swarm => swarm(DEPARTMENTS[d]!.style, DEPARTMENTS[d]!.staff ?? 0, (d + 1) * 7919);

const O = 0;
const R = 1;
const H = 2;
const K = 3;
const P = 4;
const E = 5;

/** The only places work can cross from one department to another. */
export const LINKS: [number, number][] = [
  [R, O],
  [O, H],
  [R, H],
  [R, K],
  [K, O],
  [K, P],
  [R, P],
  [E, P],
];

export interface Beat {
  text: string;
  /** work handed from one department to another, in order */
  legs: [number, number][];
  /** the legs happen at once, not one after another */
  together?: boolean;
  /** the department that does the work of this beat */
  at: number;
}

/** One hypothesis, from the idea to the book. */
export const STORY: Beat[] = [
  { text: "Research has a hypothesis. It asks Onboarding whether the data can be had.", legs: [[R, O]], at: O },
  { text: "Onboarding finds the source and builds the feed.", legs: [], at: O },
  { text: "The new feed is wired into the historical data service.", legs: [[O, H]], at: H },
  { text: "Backtesting proves the new data cannot see the future.", legs: [], at: H },
  {
    text: "Research tests its hypothesis against the backtester.",
    legs: [
      [R, H],
      [H, R],
    ],
    at: R,
  },
  { text: "Risk vets the strategy for its factor exposure.", legs: [[R, K]], at: K },
  { text: "Approved. Onboarding registers the strategy.", legs: [[K, O]], at: O },
  {
    text: "Portfolio Management weighs the alpha, the risk and the cost of trading, and plans the book.",
    legs: [
      [R, P],
      [K, P],
      [E, P],
    ],
    together: true,
    at: P,
  },
  { text: "Execution works the orders.", legs: [[P, E]], at: E },
];

/** Seconds each beat is held. */
export const BEAT = 4.2;

/** The disks are seen from above and to one side, so each is drawn this much shorter than it is wide. */
export const TILT = 0.62;

/** How far outside its lights a department's boundary is drawn. */
export const RING = 1.13;

/** A department's agents in their starting formation, already flattened by the tilt, as path data in a box from -1 to 1. */
export function restPath(d: number): string {
  const s = swarmOf(d);
  let path = "";
  for (let i = 0; i < s.count; i++) path += `M${s.x[i]!.toFixed(3)} ${(s.y[i]! * TILT).toFixed(3)}h.001`;
  return path;
}

/** The lines inside a department, and its central node where it has one, in the same box. */
export function restMarks(d: number): { edges: string; core: string } {
  const s = swarmOf(d);
  let edges = "";
  for (let e = 0; e < s.edges.length; e += 2) {
    const a = s.edges[e]!;
    const b = s.edges[e + 1]!;
    edges += `M${s.x[a]!.toFixed(3)} ${(s.y[a]! * TILT).toFixed(3)}L${s.x[b]!.toFixed(3)} ${(s.y[b]! * TILT).toFixed(3)}`;
  }
  /* the line from the central node to the centre of every pod */
  if (s.core) for (const h of s.hubs) edges += `M0 0L${h.x.toFixed(3)} ${(h.y * TILT).toFixed(3)}`;
  return { edges, core: s.core ? "M0 0h.001" : "" };
}
