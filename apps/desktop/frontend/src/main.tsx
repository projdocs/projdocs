import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "@packages/ui/styles/globals.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Outlet, Route, Routes } from "react-router-dom";
import LoginPage from "@apps/desktop/login";
import { Toaster } from "@packages/ui/components/sonner";
import { TooltipProvider } from "@packages/ui/components/tooltip";
import { ThemeProvider } from "@apps/desktop/components/theme-provider";



const RootLayout = () => (
  <div className={"bg-red-950 h-dvh w-dvw flex flex-col overflow-hidden overscroll-none"}>
    <ThemeProvider>
      <Toaster />
      <TooltipProvider>{<Outlet />}</TooltipProvider>
    </ThemeProvider>
  </div>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter basename={"/"}>
      <Routes>
        <Route path={"/"} element={<RootLayout />}>
          <Route index element={<LoginPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
);
