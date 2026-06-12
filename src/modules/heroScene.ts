/*
  Hero scene: a slowly rotating constraint polytope — the brand mark in
  motion — over a sparse drifting particle field.

  Design intent:
  - The polytope is the feasible region of a constrained optimizer; the
    copper vertex is the corner where the solve lands. It is the same
    object as the logo, so hero and mark read as one identity.
  - Slow, low-contrast, copper-tinted. The typography stays the
    protagonist; this is atmosphere, not data.
  - Respects prefers-reduced-motion by rendering a single static frame.
  - Freezes when the tab is hidden.
*/

type V3 = [number, number, number];

type Dust = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  freq: number;
};

const COPPER = "rgba(201, 163, 107, ";
const COPPER_BRIGHT = "rgba(224, 188, 133, ";
const CREAM = "rgba(236, 231, 220, ";

/* Sheared basis vectors — an irregular parallelepiped, not a cube. */
const BASIS: [V3, V3, V3] = [
  [1.0, 0.12, -0.2],
  [0.18, 0.94, 0.24],
  [-0.3, 0.2, 0.96],
];

/* Corner where all three constraints bind — the "optimal vertex". */
const OPT = 0b111;

const DUST = {
  densityDivisor: 22000,
  linkDistance: 130,
  maxSpeed: 11,
  minRadius: 0.6,
  maxRadius: 1.4,
  pointerRadius: 180,
  pointerNudge: 12,
  linkAlphaScale: 0.11,
  dotAlpha: 0.4,
  maxNodes: 130,
  minNodes: 40,
};

export function initHeroScene(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => undefined;

  const prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let dust: Dust[] = [];
  const pointer = { x: -9999, y: -9999, active: false };
  let lastT = 0;
  let raf = 0;
  let stopped = false;

  /* polytope placement, recomputed on resize */
  let px = 0;
  let py = 0;
  let pScale = 120;
  let pAlpha = 1;

  /* simulation clock + eased pointer parallax */
  let t = prefersReduced ? 14 : 0;
  let yawOff = 0;
  let pitchOff = 0;

  // ── geometry ─────────────────────────────────────────────────

  const corners: V3[] = [];
  for (let i = 0; i < 8; i++) {
    const s = [i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1];
    corners.push([
      s[0]! * BASIS[0][0] + s[1]! * BASIS[1][0] + s[2]! * BASIS[2][0],
      s[0]! * BASIS[0][1] + s[1]! * BASIS[1][1] + s[2]! * BASIS[2][1],
      s[0]! * BASIS[0][2] + s[1]! * BASIS[1][2] + s[2]! * BASIS[2][2],
    ]);
  }

  const edges: Array<[number, number]> = [];
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      const x = i ^ j;
      if (x === 1 || x === 2 || x === 4) edges.push([i, j]);
    }
  }

  /* 6 quad faces: fix one bit, walk the other two in Gray order */
  const faces: number[][] = [];
  const gray = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
  ];
  for (let axis = 0; axis < 3; axis++) {
    for (let sign = 0; sign < 2; sign++) {
      const others = [0, 1, 2].filter((a) => a !== axis);
      faces.push(
        gray.map(
          ([g0, g1]) =>
            (sign << axis) | (g0! << others[0]!) | (g1! << others[1]!),
        ),
      );
    }
  }
  /* the three faces that meet at the optimal vertex */
  const optFaces = new Set(
    faces.map((f, idx) => (f.includes(OPT) ? idx : -1)).filter((i) => i >= 0),
  );

  const rotated: V3[] = corners.map(() => [0, 0, 0]);
  const projected: Array<[number, number]> = corners.map(() => [0, 0]);
  /* max corner length, for normalizing depth → alpha */
  const reach = Math.max(...corners.map((c) => Math.hypot(c[0], c[1], c[2])));
  /* mild perspective — enough parallax that the solid never reads flat */
  const FOCAL = reach * 4.4;

  function rotate(): void {
    const yaw = 0.7 + t * 0.085 + yawOff;
    const pitch = 0.42 + 0.1 * Math.sin(t * 0.06) + pitchOff;
    const roll = -0.06 + 0.05 * Math.sin(t * 0.043);

    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cx = Math.cos(pitch), sx = Math.sin(pitch);
    const cz = Math.cos(roll), sz = Math.sin(roll);

    for (let i = 0; i < corners.length; i++) {
      const [x0, y0, z0] = corners[i]!;
      // Ry
      const x1 = x0 * cy + z0 * sy;
      const z1 = -x0 * sy + z0 * cy;
      // Rx
      const y2 = y0 * cx - z1 * sx;
      const z2 = y0 * sx + z1 * cx;
      // Rz
      const x3 = x1 * cz - y2 * sz;
      const y3 = x1 * sz + y2 * cz;
      rotated[i]![0] = x3;
      rotated[i]![1] = y3;
      rotated[i]![2] = z2;

      const f = FOCAL / (FOCAL - z2);
      projected[i]![0] = px + x3 * pScale * f;
      projected[i]![1] = py - y3 * pScale * f;
    }
  }

  function sx(i: number): number {
    return projected[i]![0];
  }
  function sy2(i: number): number {
    return projected[i]![1];
  }
  function depthAlpha(z: number): number {
    const n = (z / reach + 1) / 2; // 0 (far) … 1 (near)
    return 0.15 + n * 0.33;
  }

  function drawPolytope(): void {
    if (!ctx) return;

    rotate();

    // facet fills — front faces only (center points toward viewer)
    for (let f = 0; f < faces.length; f++) {
      const face = faces[f]!;
      let cz = 0;
      for (const vi of face) cz += rotated[vi]![2];
      if (cz <= 0) continue;
      const facing = Math.min(1, cz / (reach * 2));
      const a = (optFaces.has(f) ? 0.055 : 0.022) * facing * pAlpha;
      ctx.fillStyle = COPPER + a.toFixed(3) + ")";
      ctx.beginPath();
      ctx.moveTo(sx(face[0]!), sy2(face[0]!));
      for (let k = 1; k < face.length; k++) ctx.lineTo(sx(face[k]!), sy2(face[k]!));
      ctx.closePath();
      ctx.fill();
    }

    // edges, depth-faded; the three binding edges into OPT run brighter
    for (const [a, b] of edges) {
      const binding = a === OPT || b === OPT;
      const alpha =
        (depthAlpha((rotated[a]![2] + rotated[b]![2]) / 2) +
          (binding ? 0.24 : 0)) *
        pAlpha;
      ctx.strokeStyle = (binding ? COPPER_BRIGHT : COPPER) + alpha.toFixed(3) + ")";
      ctx.lineWidth = binding ? 1.25 : 0.9;
      ctx.beginPath();
      ctx.moveTo(sx(a), sy2(a));
      ctx.lineTo(sx(b), sy2(b));
      ctx.stroke();
    }

    // plain vertices
    for (let i = 0; i < 8; i++) {
      if (i === OPT) continue;
      const a = depthAlpha(rotated[i]![2]) * 1.15 * pAlpha;
      ctx.fillStyle = CREAM + a.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(sx(i), sy2(i), 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // the optimal vertex — copper node, soft halo, slow pulse
    const ox = sx(OPT);
    const oy = sy2(OPT);
    const pulse = 0.8 + 0.2 * Math.sin(t * 1.3);
    const near = (rotated[OPT]![2] / reach + 1) / 2;
    const va = (0.55 + near * 0.45) * pAlpha;

    const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 26);
    glow.addColorStop(0, COPPER + (0.32 * pulse * va).toFixed(3) + ")");
    glow.addColorStop(1, COPPER + "0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ox, oy, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = COPPER_BRIGHT + (0.4 * pulse * va).toFixed(3) + ")";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ox, oy, 9 + pulse * 1.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = COPPER_BRIGHT + (0.95 * va).toFixed(3) + ")";
    ctx.beginPath();
    ctx.arc(ox, oy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── dust field ───────────────────────────────────────────────

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    const wide = width >= 880;
    px = wide ? width * 0.72 : width * 0.78;
    py = wide ? height * 0.5 : height * 0.7;
    pScale = clamp(Math.min(width, height) * (wide ? 0.155 : 0.24), 80, 150);
    pAlpha = wide ? 1 : 0.7;

    const target = clamp(
      Math.floor((width * height) / DUST.densityDivisor),
      DUST.minNodes,
      DUST.maxNodes,
    );
    if (dust.length < target) {
      while (dust.length < target) dust.push(spawn());
    } else if (dust.length > target) {
      dust.length = target;
    }
    for (const n of dust) {
      if (n.x < 0 || n.x > width || n.y < 0 || n.y > height) {
        n.x = Math.random() * width;
        n.y = Math.random() * height;
      }
    }
  }

  function spawn(): Dust {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.25 + Math.random() * 0.75) * DUST.maxSpeed;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: DUST.minRadius + Math.random() * (DUST.maxRadius - DUST.minRadius),
      phase: Math.random() * Math.PI * 2,
      freq: 0.25 + Math.random() * 0.5,
    };
  }

  function step(dt: number): void {
    t += dt;

    // eased pointer parallax on the polytope
    const npx = pointer.active ? (pointer.x / Math.max(1, width)) * 2 - 1 : 0;
    const npy = pointer.active ? (pointer.y / Math.max(1, height)) * 2 - 1 : 0;
    const ease = Math.min(1, dt * 2.2);
    yawOff += (npx * 0.1 - yawOff) * ease;
    pitchOff += (-npy * 0.07 - pitchOff) * ease;

    for (const n of dust) {
      n.x += n.vx * dt;
      n.y += n.vy * dt;

      const buf = 24;
      if (n.x < -buf) n.x = width + buf;
      else if (n.x > width + buf) n.x = -buf;
      if (n.y < -buf) n.y = height + buf;
      else if (n.y > height + buf) n.y = -buf;

      if (pointer.active) {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        const r = DUST.pointerRadius;
        if (d2 < r * r && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (1 - d / r) * DUST.pointerNudge;
          n.vx += (dx / d) * f * dt;
          n.vy += (dy / d) * f * dt;
        }
      }

      n.vx *= 0.998;
      n.vy *= 0.998;
      const sp2 = n.vx * n.vx + n.vy * n.vy;
      if (sp2 > DUST.maxSpeed * DUST.maxSpeed) {
        const sp = Math.sqrt(sp2);
        n.vx = (n.vx / sp) * DUST.maxSpeed;
        n.vy = (n.vy / sp) * DUST.maxSpeed;
      }

      n.phase += n.freq * dt;
    }
  }

  function drawDust(): void {
    if (!ctx) return;

    const ld = DUST.linkDistance;
    const ld2 = ld * ld;
    ctx.lineWidth = 0.6;

    for (let i = 0; i < dust.length; i++) {
      const a = dust[i]!;
      for (let j = i + 1; j < dust.length; j++) {
        const b = dust[j]!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < ld2) {
          const d = Math.sqrt(d2);
          const k = 1 - d / ld;
          ctx.strokeStyle = COPPER + (k * k * DUST.linkAlphaScale).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of dust) {
      const pulse = 0.85 + 0.15 * Math.sin(n.phase);
      ctx.fillStyle = COPPER + (DUST.dotAlpha * pulse).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw(): void {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    drawDust();
    drawPolytope();
  }

  function tick(now: number): void {
    if (stopped) return;
    if (lastT === 0) lastT = now;
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    step(dt);
    draw();
    raf = requestAnimationFrame(tick);
  }

  function onResize(): void {
    resize();
    if (prefersReduced) draw();
  }

  function onPointer(e: PointerEvent): void {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  }

  function onPointerLeave(): void {
    pointer.active = false;
    pointer.x = -9999;
    pointer.y = -9999;
  }

  function onVisibility(): void {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      lastT = 0;
    } else if (!stopped && !prefersReduced) {
      raf = requestAnimationFrame(tick);
    }
  }

  // ── boot ─────────────────────────────────────────────────────
  resize();

  const ro = "ResizeObserver" in window ? new ResizeObserver(onResize) : null;
  if (ro) ro.observe(canvas);
  else window.addEventListener("resize", onResize);

  const heroSection = canvas.closest(".hero") as HTMLElement | null;
  const pointerTarget = heroSection ?? document.body;
  pointerTarget.addEventListener("pointermove", onPointer, { passive: true });
  pointerTarget.addEventListener("pointerleave", onPointerLeave, { passive: true });

  document.addEventListener("visibilitychange", onVisibility);

  if (prefersReduced) {
    draw();
  } else {
    raf = requestAnimationFrame(tick);
  }

  return function dispose(): void {
    stopped = true;
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    else window.removeEventListener("resize", onResize);
    pointerTarget.removeEventListener("pointermove", onPointer);
    pointerTarget.removeEventListener("pointerleave", onPointerLeave);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
