import { app } from "electron";
import { SERVICE_ID, set } from "@workspace/desktop/electron/secrets";
import path from "node:path";
import { getTrayWindow } from "@workspace/desktop/electron/tray";
import { queryParamsToRequest } from "../../../packages/consts/src/auth";
import { AuthSettings } from "@workspace/desktop/src/lib/auth/store";

// ---- deep link handler ----
export async function handleDeepLink(link: string) {
  try {
    const url = new URL(link);
    if (url.protocol !== "projdocs:") return;
    switch (url.pathname) {
      case "/v1/auth/callback":
        const request = queryParamsToRequest(url.searchParams)
        if (
          !request.publicKey ||
          !request.supabaseUrl ||
          !request.session ||
          !request.url
        ) {
          console.warn("[DEEP LINK] invalid token received")
        } else {
          const authSettings: AuthSettings = {
            token: JSON.parse(request.session),
            url: request.url,
            supabase: {
              url: request.supabaseUrl,
              key: request.publicKey
            },
          }
          await set(JSON.stringify(authSettings))
        }

        break;
      default:
        console.warn(`[DEEP LINK]: "${url.pathname}" route unhandled`);
    }

    const w = getTrayWindow();
    if (w) {
      w.show();
      w.focus();
    }
  } catch (e) {
    console.error("Bad deep link:", link, e);
  }
}

export function registerProtocol(): void {
  let registered = false;

  if (process.platform === "win32") {
    // Required before registration on Windows
    app.setAppUserModelId(SERVICE_ID);
    if (process.defaultApp) {
      // DEV: pass electron.exe + your main script as arg
      registered = app.setAsDefaultProtocolClient(
        "projdocs",
        process.execPath,
        [ path.resolve(process.argv[1]!) ]
      );
    } else {
      registered = app.setAsDefaultProtocolClient("projdocs");
    }
  } else {
    // macOS / Linux: NO args
    registered = app.setAsDefaultProtocolClient("projdocs");
  }

  console.log("[protocol] defaultApp:", !!process.defaultApp,
    "| platform:", process.platform,
    "| argv[1]:", process.argv[1],
    "| registered:", registered);

  // If registered=false, another app may already own the scheme,
  // or the call happened before ready on some environments.
}