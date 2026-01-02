"use client";

import { ReactNode, useEffect, useState } from "react";
import { createClient } from "@workspace/supabase/client";
import { SupabaseClient } from "@workspace/supabase/types";
import { AppsStore, useAppStore } from "@workspace/web/store";
import { AuthSessionMissingError, Subscription } from "@supabase/supabase-js";
import { useRealtimeListener } from "@workspace/supabase/realtime/subscriber";



const refresh = async (supabase: SupabaseClient, store: AppsStore): Promise<void> => {

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if (!(error instanceof AuthSessionMissingError)) console.error(`auth error: ${error}`);
    store.replace("auth", { company: null, user: null, meta: null, isAdmin: null });
    return;
  } else if (data.user === null) {
    store.replace("auth", { company: null, user: null, meta: null, isAdmin: null });
    return;
  }

  const user = await supabase.from("users").select().eq("id", data.user.id).maybeSingle();
  if (user.error) {
    console.error(`auth: user error: ${user.error}`);
    store.replace("auth", { company: null, user: null, meta: null, isAdmin: null });
    return;
  } else if (!user.data) {
    store.replace("auth", { company: null, user: null, meta: null, isAdmin: null });
    return;
  }

  const company = await supabase.from("company").select().single();
  if (company.error) {
    console.error(`auth: company error: ${company.error}`);
    store.replace("auth", { company: null, user: null, meta: null, isAdmin: null });
    return;
  }

  const isAdmin = await supabase.from("admins").select().eq("id", user.data.id).maybeSingle();
  if (isAdmin.error) {
    console.error(`auth: admin error: ${isAdmin.error}`);
    store.replace("auth", { company: null, user: null, meta: null, isAdmin: null });
    return;
  }

  store.replace("auth", { company: company.data, user: user.data, meta: data.user, isAdmin: isAdmin.data !== null });
  return;
};

export const AuthProvider = ({ children }: {
  children: ReactNode;
}) => {

  const [ mounted, setMounted ] = useState(false);
  const store = useAppStore();

  // TODO: broken
  //  hypothesis: since company.id is not a uuid, this will not work (realtime expects uuid[?])
  useRealtimeListener("company", async (payload) => await refresh(createClient(), store));

  // listen to realtime changes
  useRealtimeListener("users", async ({ payload }) => {
    if(typeof store.state.auth.user?.id === "string" && payload.new?.id === store.state.auth.user.id) await refresh(createClient(), store);
  });

  useEffect(() => {

    let mounted = true;
    const supabase = createClient();
    let unsubscribe: Subscription["unsubscribe"] | undefined = undefined;

    // get the initial state
    refresh(supabase, store).then(() => {

      // listen for changes
      const listener = supabase.auth.onAuthStateChange((event, session) => {
        console.log({ AUTH_EVENT: event, session });

        // handle refresh
        refresh(supabase, store).then();
      });
      unsubscribe = listener.data.subscription.unsubscribe;

      // done
      setMounted(mounted && true);
    });

    return () => {
      mounted = false;
      setMounted(mounted);
      if (unsubscribe) unsubscribe();
    };

  }, []);

  if (mounted) return children;
  return null;
};