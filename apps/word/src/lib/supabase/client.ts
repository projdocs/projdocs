import { createClient } from "@supabase/supabase-js";
import { useMemo } from "react";
import { useAppStore } from "@workspace/word/store/app";



export const useSupabase = () => {

  const { storage } = useAppStore();

  return useMemo(() => {

    const url = new URL(window.location.toString());
    const supabaseUrl = url.searchParams.get("supabase-url");
    const supabaseKey = url.searchParams.get("supabase-key");
    const token = url.searchParams.get("token");

    return createClient(supabaseUrl!, supabaseKey!, {
      accessToken: async () => token,
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: storage,
      },
    });
  }, []);

};