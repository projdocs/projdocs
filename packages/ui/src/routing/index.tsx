"use client";
import { ComponentType, createContext, ReactNode, useContext } from "react";

export interface RouterAdapter {
  Link: ComponentType<{ href: string; children: ReactNode; className?: string }>;
  navigate: (href: string, opts?: { replace?: boolean }) => void;
  usePathname: () => string;
  useSearchParams: () => URLSearchParams;
}

const RouterContext = createContext<RouterAdapter | null>(null);

export function LibraryRouterProvider({ adapter, children }: { adapter: RouterAdapter; children: ReactNode }) {
  return <RouterContext.Provider value={adapter}>{children}</RouterContext.Provider>;
}

export function useLibraryRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("Wrap your app in <LibraryRouterProvider>");
  return ctx;
}