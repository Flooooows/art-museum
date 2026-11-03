import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// An isolated prototype build: never part of the game or workshop deployment.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist-card-lab", rollupOptions: { input: "card-lab.html" } },
  server: { host: "127.0.0.1", port: 4175 },
  preview: { host: "127.0.0.1", port: 4175 },
});
