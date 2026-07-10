"use client";

import { LibraryRouterProvider } from "@packages/ui/routing";
import { useNextAdapter } from "@packages/ui/routing/adapters/nextjs";
import { ReactNode } from "react";



export default function RouterBridge({ children }: { children: ReactNode }) {
  const adapter = useNextAdapter();
  return <LibraryRouterProvider adapter={adapter}>{children}</LibraryRouterProvider>;
}