/*
  The constraint polytope behind the Polyvaria mark.

  A feasible set is an intersection of half-spaces  n · x <= d.  This
  module turns a list of named half-spaces into a solid (vertices,
  faces, edges), solves the linear programme  max c · x  over it, and
  projects a posed frame for drawing.

  It has no DOM dependency: the page calls it at build time to emit the
  static figure and again in the browser to move it.
*/

export type Vec3 = readonly [number, number, number];
export type Mat3 = readonly [Vec3, Vec3, Vec3];

export interface HalfSpace {
  /** outward normal; need not be unit length */
  n: Vec3;
  /** offset: the face lies on n · x = d */
  d: number;
}

export interface Face {
  /** index into the half-space list that cut this face */
  plane: number;
  /** vertex indices, ordered counter-clockwise seen from outside */
  loop: number[];
  normal: Vec3;
}

export interface Edge {
  a: number;
  b: number;
  /** the two faces that meet along this edge */
  faces: [number, number];
}

export interface Solid {
  vertices: Vec3[];
  faces: Face[];
  edges: Edge[];
  /** for each vertex, the faces that meet there */
  facesAt: number[][];
}

const EPS = 1e-7;

export const dot = (a: Vec3, b: Vec3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export const sub = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];

export const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];

export const norm = (a: Vec3): Vec3 => {
  const len = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / len, a[1] / len, a[2] / len];
};

export const apply = (m: Mat3, v: Vec3): Vec3 => [dot(m[0], v), dot(m[1], v), dot(m[2], v)];

/** Mᵀ v. For a rotation this is the inverse. */
export const applyT = (m: Mat3, v: Vec3): Vec3 => [
  m[0][0] * v[0] + m[1][0] * v[1] + m[2][0] * v[2],
  m[0][1] * v[0] + m[1][1] * v[1] + m[2][1] * v[2],
  m[0][2] * v[0] + m[1][2] * v[1] + m[2][2] * v[2],
];

/** Yaw about the vertical axis, then pitch toward the viewer. */
export function rotation(yaw: number, pitch: number): Mat3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cx = Math.cos(pitch);
  const sx = Math.sin(pitch);
  return [
    [cy, 0, sy],
    [sx * sy, cx, -sx * cy],
    [-cx * sy, sx, cx * cy],
  ];
}

/** Solve the 3x3 system whose rows are a, b, c by Cramer's rule. */
function intersect(planes: HalfSpace[], i: number, j: number, k: number): Vec3 | null {
  const a = planes[i]!.n;
  const b = planes[j]!.n;
  const c = planes[k]!.n;
  const bc = cross(b, c);
  const det = dot(a, bc);
  if (Math.abs(det) < EPS) return null;
  const ca = cross(c, a);
  const ab = cross(a, b);
  const d1 = planes[i]!.d;
  const d2 = planes[j]!.d;
  const d3 = planes[k]!.d;
  return [
    (d1 * bc[0] + d2 * ca[0] + d3 * ab[0]) / det,
    (d1 * bc[1] + d2 * ca[1] + d3 * ab[1]) / det,
    (d1 * bc[2] + d2 * ca[2] + d3 * ab[2]) / det,
  ];
}

/**
 * Enumerate the vertices of the intersection, then recover faces and
 * edges. Brute force over plane triples: fine for a dozen half-spaces.
 */
export function buildSolid(planes: HalfSpace[]): Solid {
  const vertices: Vec3[] = [];
  const onPlanes: Set<number>[] = [];

  for (let i = 0; i < planes.length; i++) {
    for (let j = i + 1; j < planes.length; j++) {
      for (let k = j + 1; k < planes.length; k++) {
        const p = intersect(planes, i, j, k);
        if (!p) continue;
        if (planes.some((h) => dot(h.n, p) > h.d + 1e-6)) continue;
        let at = vertices.findIndex(
          (q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 1e-5,
        );
        if (at < 0) {
          at = vertices.push(p) - 1;
          onPlanes.push(new Set());
        }
        onPlanes[at]!.add(i).add(j).add(k);
      }
    }
  }

  const faces: Face[] = [];
  planes.forEach((h, plane) => {
    const members = vertices.map((_, v) => v).filter((v) => onPlanes[v]!.has(plane));
    if (members.length < 3) return;
    const normal = norm(h.n);
    const centre = scale(
      members.reduce<Vec3>(
        (acc, v) => [acc[0] + vertices[v]![0], acc[1] + vertices[v]![1], acc[2] + vertices[v]![2]],
        [0, 0, 0],
      ),
      1 / members.length,
    );
    // an in-plane frame to sort the members by angle
    const seed: Vec3 = Math.abs(normal[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = norm(cross(normal, seed));
    const w = cross(normal, u);
    const loop = members
      .map((v) => {
        const r = sub(vertices[v]!, centre);
        return { v, angle: Math.atan2(dot(r, w), dot(r, u)) };
      })
      .sort((p, q) => p.angle - q.angle)
      .map((p) => p.v);
    faces.push({ plane, loop, normal });
  });

  const edgeMap = new Map<string, Edge>();
  faces.forEach((face, f) => {
    face.loop.forEach((a, i) => {
      const b = face.loop[(i + 1) % face.loop.length]!;
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      const seen = edgeMap.get(key);
      if (seen) seen.faces[1] = f;
      else edgeMap.set(key, { a: Math.min(a, b), b: Math.max(a, b), faces: [f, f] });
    });
  });

  const facesAt = vertices.map((_, v) =>
    faces.map((face, f) => (face.loop.includes(v) ? f : -1)).filter((f) => f >= 0),
  );

  return { vertices, faces, edges: [...edgeMap.values()], facesAt };
}

/** The vertex that maximises c · x. A linear objective always has one. */
export function solve(solid: Solid, c: Vec3): number {
  let best = 0;
  let bestValue = -Infinity;
  solid.vertices.forEach((v, i) => {
    const value = dot(c, v);
    if (value > bestValue) {
      bestValue = value;
      best = i;
    }
  });
  return best;
}

export interface Pose {
  yaw: number;
  pitch: number;
  /** objective direction in view space; z points at the viewer */
  objective: Vec3;
}

export interface Viewport {
  cx: number;
  cy: number;
  /** pixels per model unit */
  unit: number;
}

export type EdgeKind = "hidden" | "inner" | "outline";

export interface Frame {
  /** projected vertices in SVG user units */
  points: Array<readonly [number, number]>;
  /** per edge: hidden behind the solid, a visible crease, or on the outline */
  edges: EdgeKind[];
  /** per face: does it face the viewer */
  front: boolean[];
  /** index of the optimal vertex */
  optimum: number;
  /** faces that meet at the optimum: the binding constraints */
  binding: number[];
}

export function pose(solid: Solid, p: Pose, view: Viewport): Frame {
  const m = rotation(p.yaw, p.pitch);
  const turned = solid.vertices.map((v) => apply(m, v));
  const points = turned.map((v) => [view.cx + v[0] * view.unit, view.cy - v[1] * view.unit] as const);
  const front = solid.faces.map((face) => apply(m, face.normal)[2] > 1e-4);
  const edges = solid.edges.map<EdgeKind>((e) => {
    const a = front[e.faces[0]]!;
    const b = front[e.faces[1]]!;
    if (a && b) return "inner";
    if (a || b) return "outline";
    return "hidden";
  });
  const optimum = solve(solid, applyT(m, p.objective));
  return { points, edges, front, optimum, binding: solid.facesAt[optimum]! };
}
