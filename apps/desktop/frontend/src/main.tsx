import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "@packages/ui/styles/globals.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouteObject, RouterProvider } from "react-router-dom";
import routes from "@apps/desktop/routes";



const router = createHashRouter(routes as RouteObject[]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />,
  </React.StrictMode>,
);
