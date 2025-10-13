import React from "react";
import { createRoot } from "react-dom/client";
import "./global.d.ts";
import "./index.css";
import App from "@workspace/desktop/src/App";

createRoot(document.getElementById("root")!).render(<App />);