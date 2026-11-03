import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  publicDir: command === "build" ? false : "public",
  build: {
    rollupOptions: {
      input: { app: "index.html" },
      output: {
        manualChunks: { react: ["react", "react-dom", "react-dom/client"] },
      },
    },
  },
}));
