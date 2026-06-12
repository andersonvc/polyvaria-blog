/*
  Hero stats strip. Figures derive from the signal library at render
  time (same source of truth as the Library section) so the hero can
  never drift out of sync with the content.
*/

import { FAMILIES } from "../content/library";

export function mountStats(): void {
  const host = document.querySelector<HTMLElement>("[data-hero-stats]");
  if (!host) return;

  const live = FAMILIES.reduce((a, f) => a + f.liveCount, 0);
  const candidates = FAMILIES.reduce((a, f) => a + f.candidateCount, 0);

  const stats: Array<[string, string]> = [
    [String(live), "production signals"],
    [String(candidates), "candidates in research"],
    [String(FAMILIES.length), "research pods"],
    ["1", "long-only book"],
  ];

  const frag = document.createDocumentFragment();
  for (const [num, label] of stats) {
    const item = document.createElement("div");
    item.className = "hero__stat";

    const n = document.createElement("span");
    n.className = "hero__stat-num";
    n.textContent = num;

    const l = document.createElement("span");
    l.className = "hero__stat-label";
    l.textContent = label;

    item.append(n, l);
    frag.append(item);
  }
  host.append(frag);
}
