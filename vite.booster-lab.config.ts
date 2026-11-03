import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Isolated visual study. Never included in either Firebase deployment target.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist-booster-lab",
    rollupOptions: { input: "booster-lab.html" },
  },
  server: { host: "127.0.0.1", port: 4177 },
  preview: { host: "127.0.0.1", port: 4178 },
});
