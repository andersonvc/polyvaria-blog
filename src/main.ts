/*
  Entry. Wires styles + every interactive module.
*/

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections.css";

import { initHeroScene } from "./modules/heroScene";
import { mountLibrary } from "./modules/library";
import { mountNav } from "./modules/nav";
import { mountProgress } from "./modules/progress";
import { mountReveal, rescanReveal } from "./modules/reveal";
import { mountStats } from "./modules/stats";

function ready(fn: () => void): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}

ready(() => {
  // year stamp in footer
  const year = document.querySelector<HTMLElement>("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  // hero animation — constraint polytope + dust field
  const canvas = document.querySelector<HTMLCanvasElement>("[data-hero-scene]");
  if (canvas) initHeroScene(canvas);

  // hero figures, derived from the signal library
  mountStats();

  // signal library (renders tiles into [data-library])
  mountLibrary();

  // scroll behaviors — native scroll, no smoothing dependency
  mountNav();
  mountProgress();
  mountReveal();
  // library tiles were just appended — re-observe them
  rescanReveal();
});
