"use client";
import { createContext, ReactNode, useContext } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@packages/supabase";



export interface SupabaseAdapter {
  client: () => SupabaseClient<Database>;
}

const RouterContext = createContext<SupabaseAdapter | null>(null);

export function SupabaseProvider({ adapter, children }: { adapter: SupabaseAdapter; children: ReactNode }) {
  return <RouterContext.Provider value={adapter}>{children}</RouterContext.Provider>;
}

export function useLibrarySupabase(): SupabaseClient<Database> {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("Wrap your app in <SupabaseProvider>");
  return ctx.client();
}