import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "@packages/ui/styles/globals.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Routes } from "@apps/desktop/routes/routes";



ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter basename={"/"}>
      <Routes />
    </HashRouter>
  </React.StrictMode>,
);
