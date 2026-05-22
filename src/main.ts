/*
  Entry. Wires styles + every interactive module.
*/

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections.css";

import { initConstellation } from "./modules/constellation";
import { mountLibrary } from "./modules/library";
import { mountNav } from "./modules/nav";
import { mountReveal, rescanReveal } from "./modules/reveal";

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

  // hero animation
  const canvas = document.querySelector<HTMLCanvasElement>("[data-constellation]");
  if (canvas) initConstellation(canvas);

  // signal library (renders tiles into [data-library])
  mountLibrary();

  // scroll behaviors — native scroll, no smoothing dependency
  mountNav();
  mountReveal();
  // library tiles were just appended — re-observe them
  rescanReveal();
});
