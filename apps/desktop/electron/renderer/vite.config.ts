import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";



export default defineConfig({
  plugins: [ react(), tailwindcss() ],
  root: path.resolve(__dirname),
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "../../dist/renderer"),
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true
  }
});