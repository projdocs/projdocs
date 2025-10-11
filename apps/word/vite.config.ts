import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "path";
import mkcert from "vite-plugin-mkcert";



export default defineConfig({
  plugins: [
    mkcert(),
    viteStaticCopy({
      targets: [
        // { src: "manifest.xml", dest: "" },
        { src: "public/icons/**/*", dest: "icons" },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        commands: resolve(__dirname, "commands.html"),
      },
    },
    outDir: "dist",
  },
  server: {
    port: 3000,
  },
});