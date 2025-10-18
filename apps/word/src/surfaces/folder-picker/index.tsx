import React from "react";
import { createRoot } from "react-dom/client";
import App from "@workspace/word/surfaces/folder-picker/App";
import "./index.css";

declare global {
  interface Window { Office?: typeof Office; }
}

function domReady(): Promise<void> {
  return new Promise((res) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => res(), { once: true });
    } else res();
  });
}

function officeReady(): Promise<void> {
  return new Promise((res) => {
    // If not running inside Office, just resolve so dev works in browser.
    if (!window.Office) return res();

    // Preferred
    if (typeof Office.onReady === "function") {
      Office.onReady().then(() => res()).catch(() => res()); // be permissive for HMR
      return;
    }

    // Older hosts fallback
    (Office as any).initialize = () => res();
  });
}

async function boot() {
  await domReady();
  await officeReady();

  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("#root not found");

  createRoot(rootEl).render(<App />);
}

boot().catch((e) => {
  console.error("Boot error:", e);
});