import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local validation only. No Hosting configuration targets this directory.
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: "dist-enrichment-351",
    rollupOptions: { input: "review-351.html" },
  },
});
