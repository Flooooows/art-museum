import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  appType: "mpa",
  plugins: [react()],
  // Only the explicit allowlist is copied after the production build.
  publicDir: command === "build" ? false : "public",
  build: {
    outDir: "dist-muse-lab",
    rollupOptions: {
      input: {
        lab: "muse-lab.html",
        cards: "card-lab.html",
        boosters: "booster-lab.html",
        opening: "opening-lab.html",
      },
      output: {
        manualChunks: { react: ["react", "react-dom", "react-dom/client"] },
      },
    },
  },
  server: { host: "127.0.0.1", port: 4180 },
  preview: { host: "127.0.0.1", port: 4181 },
}));
