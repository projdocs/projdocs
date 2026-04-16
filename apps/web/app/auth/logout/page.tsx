"use client";

import { useEffect } from "react";
import { supabase } from "@apps/web/lib/supabase/client";
import { useRouter } from "next/navigation";



export default function() {

  const router = useRouter();

  useEffect(() => {
    supabase().auth.signOut().then(() => router.push("/"));
  }, []);

  return (
    <></>
  );

}