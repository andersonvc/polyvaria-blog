/*
  Sticky-nav behavior:
  - Toggles `.is-scrolled` on the nav once the user has scrolled past
    the first ~80px (border + glass intensify).
  - Highlights the nav link whose section is currently in view, using
    IntersectionObserver against each `[data-section]`.
*/

export function mountNav(): void {
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (!nav) return;

  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"),
  );
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("[data-section]"),
  );

  // ── scrolled state ─────────────────────────────────────────────
  const onScroll = () => {
    if (window.scrollY > 60) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ── mobile menu toggle ─────────────────────────────────────────
  // Visible only at the mobile breakpoint via CSS. The button is in
  // the DOM at all widths so the binding is unconditional.
  const toggle = nav.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  if (toggle) {
    const openMenu = () => {
      nav.classList.add("is-menu-open");
      toggle.setAttribute("aria-expanded", "true");
    };
    const closeMenu = () => {
      nav.classList.remove("is-menu-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      if (nav.classList.contains("is-menu-open")) closeMenu();
      else openMenu();
    });
    // Tapping a link inside the open menu closes it before the browser
    // jumps the scroll position to the anchor.
    for (const link of links) {
      link.addEventListener("click", () => {
        if (nav.classList.contains("is-menu-open")) closeMenu();
      });
    }
    // Escape closes when the menu has focus or anywhere on the page.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-menu-open")) {
        closeMenu();
        toggle.focus();
      }
    });
    // If the viewport crosses back above the mobile breakpoint while
    // the menu is open, drop the open state so the desktop bar isn't
    // stuck in mobile-overlay layout.
    const mql = window.matchMedia("(min-width: 721px)");
    const onMqlChange = (ev: MediaQueryListEvent | MediaQueryList) => {
      if (ev.matches) closeMenu();
    };
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onMqlChange);
    } else if (typeof (mql as MediaQueryList & { addListener?: (cb: (ev: MediaQueryListEvent) => void) => void }).addListener === "function") {
      (mql as MediaQueryList & { addListener: (cb: (ev: MediaQueryListEvent) => void) => void }).addListener(onMqlChange);
    }
  }

  // ── active link ────────────────────────────────────────────────
  if (!("IntersectionObserver" in window)) return;

  const byId = new Map<string, HTMLAnchorElement>();
  for (const link of links) {
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("#") && href.length > 1) {
      byId.set(href.slice(1), link);
    }
  }

  const visible = new Map<string, number>(); // section id → intersection ratio

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id;
        if (!id) continue;
        if (entry.isIntersecting) {
          visible.set(id, entry.intersectionRatio);
        } else {
          visible.delete(id);
        }
      }
      // Pick whichever currently-visible section has the highest ratio.
      let bestId: string | null = null;
      let bestRatio = -1;
      for (const [id, ratio] of visible) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      }
      for (const link of links) link.classList.remove("is-active");
      if (bestId) {
        const link = byId.get(bestId);
        if (link) link.classList.add("is-active");
      }
    },
    {
      // Trigger near the middle of the viewport so the highlight aligns
      // with what's visually dominant, not what's barely peeking in.
      rootMargin: "-30% 0px -45% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    },
  );

  for (const sec of sections) io.observe(sec);
}
