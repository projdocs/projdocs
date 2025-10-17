import { app } from "electron";
import path from "node:path";

export function getAssetPath(...p: string[]) {
  return app.isPackaged
    ? path.join(process.resourcesPath, "assets", ...p)                          // ✅ packaged
    : path.join(process.cwd(), "electron", "renderer", "public", ...p);         // ✅ dev
}