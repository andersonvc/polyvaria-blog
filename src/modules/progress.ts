/*
  Reading-progress hairline pinned to the top edge. Scales on the X
  axis with document scroll; rAF-throttled, passive listener.
*/

export function mountProgress(): void {
  const bar = document.querySelector<HTMLElement>("[data-progress]");
  if (!bar) return;

  let ticking = false;

  const update = (): void => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
  };

  const onScroll = (): void => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}
