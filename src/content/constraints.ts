/*
  The constraint stack of the daily solve, as the cover figure draws it.

  Values are the deployed ones (polyvaria: deploy/config/decision.yaml,
  libs/engine/portfolio constraints). The geometry is a cartoon: the
  real feasible set has one dimension per name, this one has three, and
  the normals below were chosen to make a legible solid, not derived
  from the portfolio. Each constraint still cuts its own face or pair
  of faces, which is the part the figure is about.
*/

import { norm, type HalfSpace, type Vec3 } from "../lib/polytope";

export interface Constraint {
  id: string;
  name: string;
  /** the bound, typeset in the readout */
  bound: string;
  /** one or two faces; a band has an upper and a lower */
  faces: Array<{ side?: "upper" | "lower"; n: Vec3; d: number }>;
}

const style: Vec3 = [1, 0.06, -0.08];
const industry: Vec3 = [0.06, 1, 0.1];
const beta: Vec3 = [-0.1, 0.08, 1];
const flip = (v: Vec3): Vec3 => [-v[0], -v[1], -v[2]];

export const CONSTRAINTS: Constraint[] = [
  {
    id: "long-only",
    name: "Long only",
    bound: "w ≥ 0",
    faces: [{ n: [-1, -1, -1], d: 1.05 }],
  },
  {
    id: "name-cap",
    name: "Name cap",
    bound: "w ≤ max(5%, bench + 2%)",
    faces: [{ n: [1, 1, 1], d: 1.02 }],
  },
  {
    id: "turnover",
    name: "Turnover",
    bound: "buys + sells ≤ 30%",
    faces: [{ n: [1, -1, 1], d: 1.1 }],
  },
  {
    id: "style",
    name: "Style exposure",
    bound: "±0.30 of benchmark",
    faces: [
      { side: "upper", n: style, d: 0.8 },
      { side: "lower", n: flip(style), d: 0.8 },
    ],
  },
  {
    id: "industry",
    name: "Industry weight",
    bound: "±5% of benchmark",
    faces: [
      { side: "upper", n: industry, d: 0.78 },
      { side: "lower", n: flip(industry), d: 0.8 },
    ],
  },
  {
    id: "beta",
    name: "Predicted beta",
    bound: "0.95 to 1.05",
    faces: [
      { side: "upper", n: beta, d: 0.8 },
      { side: "lower", n: flip(beta), d: 0.8 },
    ],
  },
];

/** Flattened half-spaces, with a map back to the constraint that owns each. */
export const PLANES: HalfSpace[] = [];
export const PLANE_OWNER: Array<{ constraint: number; side?: "upper" | "lower" }> = [];

CONSTRAINTS.forEach((c, constraint) => {
  for (const face of c.faces) {
    PLANES.push({ n: norm(face.n), d: face.d });
    PLANE_OWNER.push(face.side ? { constraint, side: face.side } : { constraint });
  }
});

/** The drawing: SVG user units, shared by the build-time render and the browser. */
export const FIGURE = {
  width: 440,
  height: 400,
  view: { cx: 206, cy: 190, unit: 142 },
  /** length of the objective arrow */
  arrow: 44,
} as const;

/** The resting pose: the mark's three-quarter view. */
export const REST = { yaw: 0.62, pitch: 0.4 } as const;

/** Resting objective, in view space: up and to the right, slightly toward the viewer. */
export const REST_OBJECTIVE: Vec3 = [0.74, 0.58, 0.34];
