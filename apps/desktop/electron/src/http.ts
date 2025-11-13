import type { Server } from "http";
import cors from "cors";
import express, { Express } from "express";
import { app as App, shell } from "electron";
import { Secrets } from "@workspace/desktop/electron/src/secrets";
import https from "https";
import { trustRootCert } from "@workspace/desktop/electron/src/certs";
import { createProxyMiddleware } from "http-proxy-middleware";
import { AuthSettings } from "@workspace/desktop/src/lib/auth/store";
import path from "node:path";
import fs from "fs";
import { createClientImpl } from "../../../../packages/supabase/client";
import { Tables } from "../../../../packages/supabase/types.gen";
import { exec } from "node:child_process";
import os from "os";
import { Socket } from "node:net";



const HOST = "127.0.0.1" as const; // loopback only
const PORT = 9305 as const;
let auth: AuthSettings | null = null;

let server: Server | null = null;

const makeFolder = (...segments: string[]) => {

  const home = App.getPath("home"); // /Users/username or C:\Users\username
  const baseDir = path.join(home, ".projdocs");
  fs.mkdirSync(baseDir, { recursive: true });

  // Append any extra segments (e.g., downloads, cache, userId)
  const finalPath = path.join(baseDir, ...segments);

  // Ensure that directory exists if it ends with a folder
  const dir = path.extname(finalPath) ? path.dirname(finalPath) : finalPath;
  fs.mkdirSync(dir, { recursive: true });

  return finalPath;
};

function buildApp() {

  const app = express();

  // update auth token
  Secrets.get().then(a => auth = typeof a === "string" && a.length > 0 ? JSON.parse(a) : null);

  // cors
  app.use(cors());
  app.options(/.*/, cors()); // handle preflight requests

  // routes
  app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));

  app.get("/version", (_req, res) => res.status(200).json({
    name: appName(),
    version: appVersion(),
    electron: process.versions.electron
  }));

  app.get("/checkin", async (req, res) => {

    if (!auth) return res.status(500).json({ error: "unable to access authentication" });

    const url = new URL(`https://${HOST}:${PORT}${req.url}`);
    const fileNumber = url.searchParams.get("file-number");
    if (!fileNumber) return res.status(400).json({ error: "`file-id` query parameter is required" });
    const docPath = url.searchParams.get("doc-path");
    if (!docPath) return res.status(400).json({ error: "`doc-path` query parameter is required" });

    // get file row
    const supabase = createClientImpl(auth.supabase.url, auth.supabase.key, async () => auth?.token ?? null);
    const file = await supabase.from("files").update({ locked_by_user_id: null, }).eq("number", Number(fileNumber)).select().single();
    if (file.error) return res.status(500).json({ error: "unable to checkout file", detail: file.error });

    // delete local file
    try {
      const resolved = path.resolve(docPath);
      if (fs.existsSync(resolved)) fs.unlinkSync(resolved);
      else return res.status(400).json({ error: "file does not exist" });
    } catch (err) {
      return res.status(500).json({ error: "unable to delete file", detail: err });
    }

    // done
    return res.status(200).json({ ok: true });
  });

  app.get("/word/open/:display", async (req, res) => {
    try {

      const url = new URL(`https://${HOST}:${PORT}${req.url}`);
      const filePath = url.searchParams.get("file-path");
      if (!filePath) return res.status(400).json({ error: "`file-path` query parameter is required" });

      const base = path.join(App.getPath("home"), ".projdocs", "files");
      const safeFilePath = path.resolve(filePath); // resolve any directory traversal

      // require filepath to be in ~/.projdocs/files
      if (!safeFilePath.startsWith(base)) return res.status(401).json({ error: "unable to access authentication" });
      if (!fs.existsSync(safeFilePath)) return res.status(404).send("File not found");

      // Set headers for Word document
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${path.basename(safeFilePath)}"`
      );

      // Stream the file
      const stream = fs.createReadStream(safeFilePath);
      stream.pipe(res);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/checkout", async (req, res) => {

    if (!auth) return res.status(500).json({ error: "unable to access authentication" });
    const supabase = createClientImpl(auth.supabase.url, auth.supabase.key, async () => auth?.token ?? null);

    const url = new URL(`https://${HOST}:${PORT}${req.url}`);
    const fileID = url.searchParams.get("file-id");
    if (!fileID) return res.status(400).json({ error: "`file-id` query parameter is required" });

    const versionID = url.searchParams.get("version-id");

    // get current user
    const uid = await supabase.rpc("get_user_id");
    if (uid.error || !uid.data) return res.status(500).json({ error: "unable to retrieve user-id" });

    // get file row
    const file = await supabase.from("files").update({ locked_by_user_id: uid.data, }).eq("id", fileID).select("*, version:current_version_id (*)").single().overrideTypes<Tables<"files"> & {
      version: Tables<"files_versions"> | null
    }>();
    if (file.error) return res.status(500).json({ error: "unable to checkout file", detail: file.error });
    if (file.data.version === null) return res.status(400).json({ error: "file does not have a current version" });

    let version: Tables<"files_versions">;
    if (versionID) {
      const {
        data: v,
        error: e
      } = await supabase.from("files_versions").select().eq("id", versionID).eq("file_id", file.data.id).single();
      if (e) return res.status(400).json({ error: "unable to retrieve version", detail: e });
      version = v;
    } else {
      version = file.data.version;
    }

    // get the object
    const object = await supabase.rpc("get_storage_object_by_id", { object_id: version.object_id });
    if (object.error || object.data === null) return res.status(500).json({
      error: "unable to checkout file",
      detail: object.error ?? "no object found"
    });
    if (object.data.path_tokens === null) return res.status(500).json({
      error: "unable to checkout file",
      detail: "no path tokens on object"
    });

    // download file
    const download = await supabase.storage.from(file.data.project_id).download(object.data.path_tokens.join("/"));
    if (download.error) return res.status(500).json({ error: "unable to download file", detail: download.error });
    const buffer = Buffer.from(await download.data.arrayBuffer());
    const fileName = `${!!file.data.version.name ? (file.data.version.name.toLowerCase().endsWith(".docx") ? file.data.version.name.substring(0, file.data.version.name.length - (".docx").length) : file.data.version.name) + "-" : ""}${file.data.number}.${file.data.version.version}.docx`;
    const filePath = path.join(makeFolder("files", file.data.project_id, file.data.version.id), fileName);
    fs.writeFileSync(filePath, buffer);

    try {
      await fixPerms(filePath);
    } catch (error) {
      console.error(error);
    }

    // optional file to remove, on success
    const oldFilePath = url.searchParams.get("remove");
    if (!!oldFilePath) {
      try {
        const resolved = path.resolve(oldFilePath);
        if (fs.existsSync(resolved)) fs.unlinkSync(resolved);
      } catch (error) { // fail quietly
        console.error(error);
      }
    }

    // see: https://learn.microsoft.com/en-us/office/client-developer/office-uri-schemes
    // ofe = Open For Edit
    // ofv = Open For View
    const redirect = new URL(`https://${HOST}:${PORT}/word/open/${encodeURIComponent(fileName)}`);
    redirect.searchParams.set("file-path", filePath);

    try {
      shell.openExternal(file.data.current_version_id === version.id
        ? `ms-word:ofe|u|file://${filePath}`
        : `ms-word:ofv|u|${redirect.toString()}`);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "file downloaded successfully, but an error occurred while trying to open it",
        detail: JSON.stringify(error)
      });
    }

    res.status(201).json({ success: true, path: filePath });
  });

  app.post("/echo", (req, res) => res.status(200).json({ received: req.body ?? null }));

  app.get("/user", async (_req, res) => {
    const secret = await Secrets.get();
    if (secret !== null && secret.trim().length > 0) res.status(200).end();
    else res.status(400).end();
  });

  return app;
}

function buildForwardProxy(server: Server, app: Express) {
  const middleware = createProxyMiddleware({
    changeOrigin: true,
    ws: true,
    secure: false,
    pathRewrite: { "^/supabase": "" },
    router: () => auth ? auth.supabase.url : undefined,
    on: {
      proxyReqWs: (proxyReq, req, socket, options, head) => {
        try {

          if (auth) {

            if (proxyReq.path.startsWith("/realtime/v1/websocket")) {
              const url = new URL(`https://${HOST}:${PORT}${proxyReq.path}`);
              url.searchParams.set("apikey", auth.supabase.key);
              proxyReq.path = url.pathname + "?" + url.searchParams.toString();
            }

            proxyReq.setHeader("Authorization", `Bearer ${auth.token}`);
            proxyReq.setHeader("apikey", auth.supabase.key);

          }
        } catch (e) {
          console.error(e);
          socket.destroy(e as Error);
        }
      },
      proxyReq: (proxyReq, req, res) => {
        if (auth) {
          proxyReq.setHeader("Authorization", `Bearer ${auth.token}`);
          proxyReq.setHeader("apikey", auth.supabase.key);
        }
      },
    },
  });
  app.use("/supabase", middleware);
  server.on("upgrade", (req, socket, head) => {
    try {
      if (req.url?.startsWith("/supabase/realtime/v1/websocket")) {
        middleware.upgrade(req, socket as Socket, head);
      } else {
        socket.destroy();
      }
    } catch (err) {
      console.error("[upgrade] proxy error:", err);
      socket.destroy();
    }
  });
}

async function startHttpServer(): Promise<void> {
  if (server) return;

  // Build express and create a plain HTTP server (no HTTPS since loopback)
  const app = buildApp();

  const { key, cert } = trustRootCert();
  server = https.createServer({ key, cert }, app);

  // setup
  buildForwardProxy(server, app);

  // add minimal 404 **LAST**
  app.use((_req, res) => res.status(404).json({ error: "not found" }));

  await new Promise<void>((resolve, reject) => {
    server!.once("error", (err: any) => {
      // Helpful diagnostics if port is taken
      if (err?.code === "EADDRINUSE") {
        console.error(`[http] Port ${PORT} is already in use on ${HOST}.`);
      }
      reject(err);
    });
    server!.listen(PORT, HOST, () => {
      console.log(`[http] Listening on https://${HOST}:${PORT}`);
      resolve();
    });
  });

  // Close server when Electron is quitting
  appOnWillQuit(() => stopHttpServer().catch((e) => console.error("[http] stop error:", e)));
}

async function stopHttpServer(): Promise<void> {
  if (!server) return;
  const s = server;
  server = null;
  await new Promise<void>((resolve) => s.close(() => resolve()));
  console.log("[http] Closed");
}

// --- small helpers ---

function appOnWillQuit(cb: () => void) {
  // Ensure single subscription
  App.once("will-quit", cb);
  App.once("quit", cb);
}

function appName() {
  try {
    return App.getName();
  } catch {
    return "ProjDocs";
  }
}

function appVersion() {
  try {
    return App.getVersion();
  } catch {
    return "0.0.0";
  }
}

export const HttpServer = {
  start: startHttpServer,
  stop: stopHttpServer,
  auth: {
    set: (a: AuthSettings | null) => {
      auth = a;
    }
  }
};

const fixPerms = (filePath: string) => new Promise<void>((res, rej) => {
  if (os.platform() !== "darwin") return;
  exec(`xattr -d com.apple.provenance "${filePath}"`, (error, stdout, stderr) => {
    if (error) return rej(`exec error: ${error}`);
    if (stderr) return rej(`stderr: ${stderr}`);
    res();
  });
  exec(`xattr -d com.apple.quarantine "${filePath}"`, (error, stdout, stderr) => {
    if (error) return rej(`exec error: ${error}`);
    if (stderr) return rej(`stderr: ${stderr}`);
    res();
  });
});