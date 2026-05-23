/*
  Render the Library bento grid from FAMILIES, plus the running total
  in the footer ("42 implemented across 15 families · 82 candidates
  in active research"). The numbers are summed from FAMILIES at
  render time, not hardcoded.
*/

import { FAMILIES } from "../content/library";

export function mountLibrary(): void {
  const grid = document.querySelector<HTMLElement>("[data-library]");
  const count = document.querySelector<HTMLElement>("[data-library-count]");
  if (!grid) return;

  const frag = document.createDocumentFragment();

  for (const fam of FAMILIES) {
    const tile = document.createElement("article");
    tile.className = "library-tile";
    tile.setAttribute("data-reveal", "");

    const head = document.createElement("div");
    head.className = "library-tile__head";

    const name = document.createElement("h3");
    name.className = "library-tile__name";
    name.textContent = fam.name;

    const cnt = document.createElement("span");
    cnt.className = "library-tile__count";
    cnt.textContent = formatCount(fam.liveCount, fam.candidateCount);

    head.append(name, cnt);

    const premise = document.createElement("p");
    premise.className = "library-tile__premise";
    premise.textContent = fam.premise;

    tile.append(head, premise);

    if (fam.tags && fam.tags.length) {
      const tags = document.createElement("div");
      tags.className = "library-tile__tags";
      for (const t of fam.tags) {
        const tag = document.createElement("span");
        tag.className = "library-tile__tag";
        tag.textContent = t;
        tags.append(tag);
      }
      tile.append(tags);
    }

    frag.append(tile);
  }

  grid.append(frag);

  if (count) {
    const live = FAMILIES.reduce((a, f) => a + f.liveCount, 0);
    const cand = FAMILIES.reduce((a, f) => a + f.candidateCount, 0);
    count.textContent =
      `${live} implemented across ${FAMILIES.length} families · ${cand} candidates in active research`;
  }
}

function formatCount(live: number, candidate: number): string {
  if (live === 0 && candidate === 0) return "—";
  if (live === 0) return `${candidate} candidate`;
  if (candidate === 0) return `${live} live`;
  return `${live} live · ${candidate} candidate`;
}
