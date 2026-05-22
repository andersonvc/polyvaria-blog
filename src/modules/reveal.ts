/*
  Cheap, GPU-friendly scroll reveal — adds `.is-revealed` to anything
  carrying `[data-reveal]` once it enters the viewport. Honors
  prefers-reduced-motion by revealing everything immediately.
*/

export function mountReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!targets.length) return;

  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) {
    for (const t of targets) t.classList.add("is-revealed");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      }
    },
    {
      // Trip just before the element fully enters — gives the eye time
      // to land on the motion as it completes.
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12,
    },
  );

  for (const t of targets) io.observe(t);
}

/**
 * Late-arriving reveal targets (e.g. Library tiles built after DOM ready)
 * need to be re-observed. This helper handles a second pass.
 */
export function rescanReveal(): void {
  // Re-mount idempotently — already-revealed targets stay revealed.
  mountReveal();
}
