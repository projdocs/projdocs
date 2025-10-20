import { createClient } from "@supabase/supabase-js";
import { useMemo } from "react";
import { useAppStore } from "@workspace/word/store/app";
import { Database } from "@workspace/supabase/types";
import { CONSTANTS } from "@workspace/word/lib/consts";



export const useSupabase = () => {

  const { storage } = useAppStore();

  return useMemo(() => {

    return createClient<Database>(`${CONSTANTS.DESKTOP.HTTP_SERVER.ORIGIN}/supabase`, "-", {
      accessToken: async () => "-",
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: storage,
      },
    });
  }, [ ]);

};