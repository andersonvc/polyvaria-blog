import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5180,
    host: true,
    strictPort: false,
  },
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
