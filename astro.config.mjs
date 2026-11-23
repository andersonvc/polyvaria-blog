// @ts-check
import { defineConfig } from "astro/config";

// A static site: every page is rendered to HTML at build time and the
// only script shipped is the one that moves the cover figure.
export default defineConfig({
  output: "static",
  compressHTML: false,
  devToolbar: { enabled: false },
  server: { port: 5182, host: true },
  build: { inlineStylesheets: "never" },
});
