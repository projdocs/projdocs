import { defineConfig } from "tsup";
import path from "node:path";
import { builtinModules } from "node:module";



export default defineConfig([
  {
    entry: [
      path.join(__dirname, "src", "commands.ts")
    ],
    outDir: path.join(__dirname, "dist"),
    platform: "node",
    target: "node18",
    format: [ "cjs" ],
    splitting: false,
    sourcemap: true,
    bundle: true,
    external: [
      ...builtinModules,
      ...builtinModules.map((m) => `node:${m}`),
    ],
  },
]);