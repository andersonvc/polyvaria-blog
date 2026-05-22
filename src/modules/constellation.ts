/*
  Hero constellation. Drifting particle network on canvas 2D.

  Design intent:
  - Evoke a network of independent signal agents, faintly connected
    when proximate. Not data-bearing — purely decorative atmosphere.
  - Slow, low-contrast, copper-tinted. Avoids drawing the eye away
    from the typography.
  - Capped frame rate via rAF + a coarse dt clamp; respects prefers-
    reduced-motion by rendering a single static frame and stopping.
*/

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;          // base radius
  phase: number;      // for pulse
  freq: number;       // pulse rate
};

const PALETTE = {
  dot: "rgba(201, 163, 107, ",        // copper, alpha appended
  link: "rgba(201, 163, 107, ",        // copper hairline
  bright: "rgba(224, 188, 133, ",     // brighter copper for nodes near cursor
};

const CONFIG = {
  // density scales with viewport; ~1 node per 14000 px²
  densityDivisor: 14000,
  // pixels — link any two nodes whose distance is below this
  linkDistance: 140,
  // px per second drift
  maxSpeed: 12,
  minRadius: 0.6,
  maxRadius: 1.5,
  // mouse influence
  pointerRadius: 180,
  pointerNudge: 14,
  // visual
  linkAlphaScale: 0.18,
  dotAlpha: 0.55,
  // cap on node count regardless of viewport
  maxNodes: 220,
  minNodes: 60,
};

export function initConstellation(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => undefined;

  const prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let nodes: Node[] = [];
  const pointer = { x: -9999, y: -9999, active: false };
  let lastT = 0;
  let raf = 0;
  let stopped = false;

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = clamp(
      Math.floor((width * height) / CONFIG.densityDivisor),
      CONFIG.minNodes,
      CONFIG.maxNodes,
    );
    if (nodes.length < target) {
      while (nodes.length < target) nodes.push(spawn());
    } else if (nodes.length > target) {
      nodes.length = target;
    }
    // re-seat any nodes outside bounds after a resize
    for (const n of nodes) {
      if (n.x < 0 || n.x > width || n.y < 0 || n.y > height) {
        n.x = Math.random() * width;
        n.y = Math.random() * height;
      }
    }
  }

  function spawn(): Node {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.25 + Math.random() * 0.75) * CONFIG.maxSpeed;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
      phase: Math.random() * Math.PI * 2,
      freq: 0.25 + Math.random() * 0.5,
    };
  }

  function step(dt: number): void {
    for (const n of nodes) {
      // drift
      n.x += n.vx * dt;
      n.y += n.vy * dt;

      // soft wrap at edges with a tiny buffer to hide pop
      const buf = 24;
      if (n.x < -buf) n.x = width + buf;
      else if (n.x > width + buf) n.x = -buf;
      if (n.y < -buf) n.y = height + buf;
      else if (n.y > height + buf) n.y = -buf;

      // pointer nudge — push nodes gently away from cursor
      if (pointer.active) {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        const r = CONFIG.pointerRadius;
        if (d2 < r * r && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (1 - d / r) * CONFIG.pointerNudge;
          n.vx += (dx / d) * f * dt;
          n.vy += (dy / d) * f * dt;
        }
      }

      // tame velocity so things stay slow
      n.vx *= 0.998;
      n.vy *= 0.998;
      const sp2 = n.vx * n.vx + n.vy * n.vy;
      const maxSp = CONFIG.maxSpeed;
      if (sp2 > maxSp * maxSp) {
        const sp = Math.sqrt(sp2);
        n.vx = (n.vx / sp) * maxSp;
        n.vy = (n.vy / sp) * maxSp;
      }

      n.phase += n.freq * dt;
    }
  }

  function draw(): void {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // links first, so dots sit on top
    const ld = CONFIG.linkDistance;
    const ld2 = ld * ld;
    ctx.lineWidth = 0.6;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < ld2) {
          const d = Math.sqrt(d2);
          const t = 1 - d / ld;
          const alpha = t * t * CONFIG.linkAlphaScale;
          ctx.strokeStyle = PALETTE.link + alpha.toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // dots, with subtle pulse + pointer-proximity brightening
    for (const n of nodes) {
      const pulse = 0.85 + 0.15 * Math.sin(n.phase);
      let alpha = CONFIG.dotAlpha * pulse;
      let palette = PALETTE.dot;

      if (pointer.active) {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        const r = CONFIG.pointerRadius;
        if (d2 < r * r) {
          const t = 1 - Math.sqrt(d2) / r;
          alpha = Math.min(0.95, alpha + t * 0.55);
          palette = PALETTE.bright;
        }
      }

      ctx.fillStyle = palette + alpha.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick(now: number): void {
    if (stopped) return;
    if (lastT === 0) lastT = now;
    const dt = Math.min(0.05, (now - lastT) / 1000); // clamp to 50ms
    lastT = now;
    step(dt);
    draw();
    raf = requestAnimationFrame(tick);
  }

  function onResize(): void {
    resize();
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

  // ── boot ────────────────────────────────────────────────────
  resize();

  const ro = "ResizeObserver" in window ? new ResizeObserver(onResize) : null;
  if (ro) ro.observe(canvas);
  else window.addEventListener("resize", onResize);

  // pointer events live on the section so the canvas itself stays
  // pointer-events: none (set in CSS) and doesn't intercept clicks.
  const heroSection = canvas.closest(".hero") as HTMLElement | null;
  const pointerTarget = heroSection ?? document.body;
  pointerTarget.addEventListener("pointermove", onPointer, { passive: true });
  pointerTarget.addEventListener("pointerleave", onPointerLeave, { passive: true });

  document.addEventListener("visibilitychange", onVisibility);

  if (prefersReduced) {
    // Single static frame, no animation loop.
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
