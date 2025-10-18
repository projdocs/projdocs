import { app, dialog } from "electron";
import fs from "fs";
import path from "path";
import os from "os";
import { spawn } from "child_process";

function getCertDir() {
  if (app.isPackaged) {
    // .../Contents/Resources/certs (mac) or resources/certs (win/linux)
    return path.join(process.resourcesPath, "certs");
  }
  // dev: match your repo layout
  return path.join(process.cwd(), "electron", "resources", "certs");
}

function run(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))
    );
    child.on("error", reject);
  });
}

/**
 * Idempotently trusts rootCA.pem and returns HTTPS key/cert buffers.
 * Shows a one-time consent dialog before trusting the root, then writes a marker file.
 */
export function trustRootCert(): { key: Buffer; cert: Buffer } {
  const certDir = getCertDir();
  const rootCAPath = path.join(certDir, "rootCA.pem");
  const keyPath = path.join(certDir, "localhost.key.pem");
  const certPath = path.join(certDir, "localhost.cert.pem");

  if (!fs.existsSync(rootCAPath) || !fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw new Error(
      `[certs] Missing files in ${certDir}. Expected rootCA.pem, localhost.key.pem, localhost.cert.pem`
    );
  }

  // Tighten perms on Unix (best-effort)
  if (process.platform !== "win32") {
    try { fs.chmodSync(keyPath, 0o600); } catch {}
    try { fs.chmodSync(certPath, 0o644); } catch {}
  }

  // One-time trust of the root CA
  const marker = path.join(app.getPath("userData"), "rootCA.trusted");
  const alreadyTrusted = fs.existsSync(marker);

  async function doTrustOnce() {
    if (alreadyTrusted) return;

    const choice = dialog.showMessageBoxSync({
      type: "info",
      buttons: ["Trust Certificate", "Cancel"],
      defaultId: 0,
      cancelId: 1,
      title: "Trust Local HTTPS Certificate",
      message:
        "ProjDocs needs to add a local root certificate so your system trusts https://127.0.0.1:9305.",
      detail:
        "You can remove it later via Keychain Access / Certificate Manager. This is only used for local HTTPS.",
    });
    if (choice !== 0) return;

    try {
      if (process.platform === "darwin") {
        // Login keychain (no sudo). If you prefer system keychain, wrap a sudo flow.
        await run("security", [
          "add-trusted-cert",
          "-d",
          "-k",
          `${os.homedir()}/Library/Keychains/login.keychain-db`,
          rootCAPath,
        ]);
      } else if (process.platform === "win32") {
        // User Root store (no admin)
        await run("certutil", ["-f", "-user", "-addstore", "Root", rootCAPath]);
      } else {
        // Linux: try system trust if sudo is present; else NSS user DB (Firefox)
        await run("bash", [
          "-lc",
          `if command -v sudo >/dev/null; then
             sudo install -m 0644 "${rootCAPath}" /usr/local/share/ca-certificates/projdocs.crt &&
             sudo update-ca-certificates || true;
           fi;
           if command -v certutil >/dev/null; then
             mkdir -p "$HOME/.pki/nssdb";
             certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "ProjDocs Local Root" -i "${rootCAPath}" || true;
           fi`,
        ]);
      }

      fs.writeFileSync(marker, new Date().toISOString());
      console.log("[certs] Root CA trusted.");
    } catch (err) {
      console.warn("[certs] Root trust step failed or was canceled:", err);
      // Not fatal for loading key/cert; browsers may warn until user trusts it.
    }
  }

  // Fire and forget (don’t block server start if user cancels)
  void doTrustOnce();

  // Return key/cert for HTTPS server
  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}