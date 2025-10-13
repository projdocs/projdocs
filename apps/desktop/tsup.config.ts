import { defineConfig, Options } from "tsup";
import path from "node:path";
import { builtinModules } from "node:module";



const base: Options = {
  outDir: path.join(__dirname, "dist"),
  platform: "node",
  target: "node18",
  format: [ "cjs" ],
  splitting: false,
  sourcemap: true,
  bundle: true,
  external: [
    "electron",
    ...builtinModules,
    ...builtinModules.map((m) => `node:${m}`),
  ]
};

export default defineConfig([
  {
    ...base,
    entry: [ path.join(__dirname, "electron", "main.ts") ],
  },
  {
    ...base,
    entry: { preload: path.join(__dirname, "electron", "preload.ts") },
  },
]);