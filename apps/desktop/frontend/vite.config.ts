import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wails from "@wailsio/runtime/plugins/vite";
import * as path from "node:path";
import tailwindcss from "@tailwindcss/vite";


// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: Number(process.env.WAILS_VITE_PORT) || 9245,
    strictPort: true,
  },
  plugins: [ react(), tailwindcss(), wails("./bindings") ],
  resolve: {
    tsconfigPaths: true,
    alias: [
      { find: /^@apps\/desktop(.*)/, replacement: path.resolve(__dirname, "./src") + "$1" },
      { find: /^@apps\/web(.*)/, replacement: path.resolve(__dirname, "../web") + "$1" },
      { find: /^@packages\/ui(.*)/, replacement: path.resolve(__dirname, "../../../packages/ui/src") + "$1" },
      { find: /^@packages\/supabase(.*)/, replacement: path.resolve(__dirname, "../../../packages/supabase") + "$1" },
      { find: /^@packages\/shared(.*)/, replacement: path.resolve(__dirname, "../../../packages/shared/src") + "$1" },
    ],
  },
});
