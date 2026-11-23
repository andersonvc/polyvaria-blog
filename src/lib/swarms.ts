/*
  How the agents inside a department are organised. There are two ways.

    pods   Research. Separate pods of agents, standing round a single
           central node. No agent moves between pods, and no pod is
           joined to another; the centre of every pod is joined to the
           central node.

    dags   Every other department. Three separate directed graphs of
           agents, with nothing joining one to another. One of the three
           fires at a time, chosen at random: work enters at one agent,
           fans out across a stage of agents working side by side, and
           gathers again.

  Both are laid out in a unit disk. No DOM. The same code lays out the
  still drawing at build time and runs the swarm in the browser.
*/

export type Style = "pods" | "dags";

export interface Swarm {
  count: number;
  /** where each agent is, in a unit disk */
  x: Float32Array;
  y: Float32Array;
  /** extra brightness, 0 to 1: an agent in a graph is lifted while its stage is running */
  lift: Float32Array;
  /** each light's own beat */
  phase: Float32Array;
  rate: Float32Array;
  /** how large an agent is drawn, relative to a member of a pod */
  scale: number;
  /** a steady light, not a flicker */
  steady: boolean;
  /** places in the formation worth drawing: the centres of pods */
  hubs: { x: number; y: number }[];
  /** the formation has one node at its centre, joined to the centre of every pod */
  core: boolean;
  /** pairs of agents joined by an edge: [from, to, from, to, ...] */
  edges: Int16Array;
  /** per edge, how lit it is, 0 to 1 */
  edgeLit: Float32Array;
  /** per edge, how far along it work has travelled, 0 to 1, or -1 when nothing is on it */
  edgeRun: Float32Array;
  /** work has arrived from another department: a graph formation sets one of its graphs running now */
  fire(): void;
  /** advance to time t */
  step(t: number, dt: number): void;
}

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** A small seeded generator, so a swarm starts the same on every build and every visit. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Formation {
  count: number;
  scale: number;
  steady: boolean;
  hubs: { x: number; y: number }[];
  core: boolean;
  edges: number[];
  /** set every agent's place for time t */
  aim(t: number, tx: Float32Array, ty: Float32Array): void;
  /** let the formation reorganise itself */
  churn(t: number): void;
  /** work has arrived from outside */
  fire(): void;
  /** say which agents and edges are working at time t */
  flow(t: number, lift: Float32Array, edgeLit: Float32Array, edgeRun: Float32Array): void;
}

/* ── Research: separate pods, every one joined to a single central node ─ */

/** Split n into parts proportional to the weights, every part at least one. */
function share(n: number, weights: number[]): number[] {
  const total = weights.reduce((s, w) => s + w, 0);
  const parts = weights.map((w) => Math.max(1, Math.floor((n * w) / total)));
  let left = n - parts.reduce((s, p) => s + p, 0);
  for (let k = 0; left > 0; k = (k + 1) % parts.length, left--) parts[k] = parts[k]! + 1;
  return parts;
}

function pods(n: number, rnd: () => number): Formation {
  const K = 9;

  /* Every agent belongs to one pod for good. Pods do not interact: none trades members with another,
     and nothing joins one pod to the next. What they share is the single node at the centre of the
     department, to which the centre of every pod is joined. */
  /* pods are of very different sizes: the largest has several times the agents of the smallest */
  const size = share(n, Array.from({ length: K }, () => 0.3 + rnd() ** 1.5 * 1.9));
  const pod = new Int16Array(n);
  const rank = new Int16Array(n);
  let i = 0;
  size.forEach((m, g) => {
    for (let r = 0; r < m; r++, i++) {
      pod[i] = g;
      rank[i] = r;
    }
  });
  const reachOf = (g: number): number => 0.53 * Math.sqrt(size[g]! / n);

  /* Nothing about where the pods stand is regular: each is dropped at its own bearing and its own
     distance from the central node, so no two lines to the centre are the same length. They are then
     nudged apart until none overlaps another, the central node or the edge of the department. */
  const CLEAR = 0.045;
  const hubs = Array.from({ length: K }, (_, g) => {
    const a = ((g + (rnd() - 0.5) * 0.9) * TAU) / K + 0.4;
    const near = reachOf(g) + 0.12;
    const far = 0.95 - reachOf(g);
    const r = near + (0.25 + 0.75 * rnd()) * Math.max(0, far - near);
    return { x: r * Math.cos(a), y: r * Math.sin(a) };
  });
  for (let pass = 0; pass < 400; pass++) {
    for (let a = 0; a < K; a++) {
      for (let b = a + 1; b < K; b++) {
        const dx = hubs[b]!.x - hubs[a]!.x;
        const dy = hubs[b]!.y - hubs[a]!.y;
        const d = Math.hypot(dx, dy) || 1e-6;
        const need = reachOf(a) + reachOf(b) + CLEAR;
        if (d >= need) continue;
        const push = (need - d) / 2 / d;
        hubs[a]!.x -= dx * push;
        hubs[a]!.y -= dy * push;
        hubs[b]!.x += dx * push;
        hubs[b]!.y += dy * push;
      }
    }
    /* no line from the centre to one pod may run through another: a pod in the way is moved aside */
    for (let a = 0; a < K; a++) {
      for (let b = 0; b < K; b++) {
        if (a === b) continue;
        const A = hubs[a]!;
        const B = hubs[b]!;
        const along = Math.max(0, Math.min(1, (A.x * B.x + A.y * B.y) / (B.x * B.x + B.y * B.y)));
        if (along >= 1) continue;
        let ox = A.x - B.x * along;
        let oy = A.y - B.y * along;
        let off = Math.hypot(ox, oy);
        const need = reachOf(a) + 0.035;
        if (off >= need) continue;
        if (off < 1e-4) {
          ox = -B.y;
          oy = B.x;
          off = Math.hypot(ox, oy);
        }
        A.x += (ox / off) * (need - off) * 0.6;
        A.y += (oy / off) * (need - off) * 0.6;
      }
    }
    for (let g = 0; g < K; g++) {
      const h = hubs[g]!;
      const d = Math.hypot(h.x, h.y) || 1e-6;
      const kept = Math.min(0.95 - reachOf(g), Math.max(reachOf(g) + 0.09, d));
      h.x *= kept / d;
      h.y *= kept / d;
    }
  }
  /* each pod turns at its own pace and in its own direction */
  const pace = Array.from({ length: K }, () => (0.08 + rnd() * 0.18) * (rnd() < 0.5 ? 1 : -1));

  return {
    count: n,
    scale: 1,
    steady: false,
    hubs,
    core: true,
    edges: [],
    flow: () => {},
    churn: () => {},
    fire: () => {},
    aim(t, tx, ty) {
      for (let a = 0; a < n; a++) {
        const g = pod[a]!;
        const m = size[g]!;
        const rr = reachOf(g) * Math.sqrt((rank[a]! + 0.5) / m);
        const turn = rank[a]! * GOLDEN + t * pace[g]!;
        tx[a] = hubs[g]!.x + rr * Math.cos(turn);
        ty[a] = hubs[g]!.y + rr * Math.sin(turn);
      }
    },
  };
}

/* ── Every other department: directed graphs of agents, run in sequence ─ */

/** How many agents work side by side at each stage of a graph. Every graph starts and ends with one. */
const SHAPES = [
  [1, 2, 3, 2, 1],
  [1, 3, 2, 1],
  [1, 2, 2, 1],
  [1, 3, 3, 1],
  [1, 2, 3, 1],
  [1, 3, 2, 2, 1],
  [1, 2, 3, 3, 1],
];

function dags(_n: number, rnd: () => number): Formation {
  /* Three separate graphs, one above another. Nothing joins one graph to another. At any moment at
     most one of them is running, and which one fires next is drawn at random. */
  const ROWS = [-0.55, 0, 0.55];
  const RISE = 0.17;

  const xs: number[] = [];
  const ys: number[] = [];
  const edges: number[] = [];
  /* which graph an agent or an edge belongs to, and which stage of it */
  const graphOf: number[] = [];
  const stageOf: number[] = [];
  const edgeGraph: number[] = [];
  const edgeStage: number[] = [];
  const stages: number[] = [];

  ROWS.forEach((rowY, g) => {
    const shape = SHAPES[Math.floor(rnd() * SHAPES.length)]!;
    const half = 0.84 * Math.sqrt(1 - rowY * rowY) - 0.05;
    stages.push(shape.length);
    let before: number[] = [];
    shape.forEach((width, s) => {
      const stage: number[] = [];
      for (let j = 0; j < width; j++) {
        stage.push(xs.length);
        xs.push(-half + (2 * half * s) / (shape.length - 1));
        ys.push(rowY + (j - (width - 1) / 2) * RISE);
        graphOf.push(g);
        stageOf.push(s);
      }
      /* every agent of a stage hands on to the next stage, and every agent of the next is reached */
      if (before.length) {
        const reached = new Set<number>();
        const add = (a: number, b: number): void => {
          edges.push(a, b);
          edgeGraph.push(g);
          edgeStage.push(s - 1);
          reached.add(b);
        };
        before.forEach((a, i) => {
          if (before.length === 1) stage.forEach((b) => add(a, b));
          else add(a, stage[Math.round((i * (stage.length - 1)) / (before.length - 1))]!);
        });
        stage.forEach((b, j) => {
          if (!reached.has(b)) add(before[Math.round((j * (before.length - 1)) / Math.max(1, stage.length - 1))]!, b);
        });
      }
      before = stage;
    });
  });

  const count = xs.length;
  const edgeCount = edges.length / 2;
  /* every department keeps its own time */
  const tick = 0.34 + rnd() * 0.16;
  const REST = 1.4;
  /* the run in progress: which graph fired, and when */
  let firing = Math.floor(rnd() * ROWS.length);
  let since = Number.NaN;
  /* set when work arrives from another department: the next graph fires at once */
  let called = false;
  /* when each agent and edge last ran, so it can fade once the work has moved on */
  const agentOn = new Float32Array(count).fill(-1e6);
  const edgeOn = new Float32Array(edgeCount).fill(-1e6);

  return {
    count,
    scale: 1.7,
    steady: true,
    hubs: [],
    core: false,
    edges,
    churn: () => {},
    fire() {
      called = true;
    },
    aim(_t, tx, ty) {
      for (let a = 0; a < count; a++) {
        tx[a] = xs[a]!;
        ty[a] = ys[a]!;
      }
    },
    flow(t, lift, edgeLit, edgeRun) {
      if (Number.isNaN(since)) since = t - tick * 1.6;
      let u = (t - since) / tick;
      if (called || u > stages[firing]! + REST) {
        called = false;
        /* that graph is done: one of the three fires next, at random */
        firing = Math.floor(rnd() * ROWS.length);
        since = t;
        u = 0;
      }
      const now = Math.floor(u);
      const frac = u - now;
      for (let a = 0; a < count; a++) {
        const on = graphOf[a] === firing && stageOf[a] === now;
        if (on) agentOn[a] = t;
        lift[a] = on ? 1 : 0.75 * Math.exp(-(t - agentOn[a]!) / 0.7);
      }
      for (let e = 0; e < edgeCount; e++) {
        const on = edgeGraph[e] === firing && edgeStage[e] === now;
        if (on) edgeOn[e] = t;
        edgeLit[e] = on ? frac : 0.75 * Math.exp(-(t - edgeOn[e]!) / 0.7);
        edgeRun[e] = on && frac > 0.3 ? (frac - 0.3) / 0.7 : -1;
      }
    },
  };
}

const BUILD: Record<Style, (n: number, rnd: () => number) => Formation> = { pods, dags };

/** A department's swarm. `staff` is how many agents a pod formation has; a graph formation sets its own number. */
export function swarm(style: Style, staff: number, seed: number): Swarm {
  const rnd = seeded(seed);
  const formation = BUILD[style](staff, rnd);
  const count = formation.count;

  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const tx = new Float32Array(count);
  const ty = new Float32Array(count);
  const lift = new Float32Array(count);
  const phase = new Float32Array(count);
  const rate = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    phase[i] = rnd() * TAU;
    rate[i] = 0.4 + rnd() * 1.1;
  }
  const edges = Int16Array.from(formation.edges);
  const edgeLit = new Float32Array(edges.length / 2);
  const edgeRun = new Float32Array(edges.length / 2).fill(-1);

  formation.aim(0, tx, ty);
  x.set(tx);
  y.set(ty);

  /* an agent in a graph holds its place; an agent in a pod drifts a little on its own */
  const drift = formation.steady ? 0 : 0.012;

  return {
    count,
    x,
    y,
    lift,
    phase,
    rate,
    scale: formation.scale,
    steady: formation.steady,
    hubs: formation.hubs,
    core: formation.core,
    edges,
    edgeLit,
    edgeRun,
    fire: () => formation.fire(),
    step(t, dt) {
      formation.churn(t);
      formation.aim(t, tx, ty);
      formation.flow(t, lift, edgeLit, edgeRun);
      const pull = 1 - Math.exp(-dt * 3);
      for (let i = 0; i < count; i++) {
        const wx = tx[i]! + drift * Math.sin(t * rate[i]! + phase[i]!);
        const wy = ty[i]! + drift * Math.cos(t * rate[i]! * 1.3 + phase[i]!);
        x[i] = x[i]! + (wx - x[i]!) * pull;
        y[i] = y[i]! + (wy - y[i]!) * pull;
      }
    },
  };
}
