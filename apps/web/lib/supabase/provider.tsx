"use client";

import { SupabaseProvider } from "@packages/ui/lib/supabase-adapter";
import { supabase } from "@apps/web/lib/supabase/client";
import { ReactNode, useEffect, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SupabaseProvider adapter={{ client: supabase }}>
      {children}
    </SupabaseProvider>
  );
}