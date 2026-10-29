import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { app: "index.html", review: "review.html" },
      output: {
        manualChunks: { react: ["react", "react-dom", "react-dom/client"] },
      },
    },
  },
});
