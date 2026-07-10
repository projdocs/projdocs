import { useNavigate } from "react-router";
import { JSX, useEffect } from "react";
import { StorageKeys } from "@apps/desktop/lib/storage";
import { toast } from "sonner";
import { supabase } from "@apps/desktop/lib/supabase";



export default function Landing(): JSX.Element {

  const navigate = useNavigate();
  useEffect(() => {

    let mounted: boolean = true;


    const api = window.localStorage.getItem(StorageKeys.ProjDocs.Host.API);
    const web = window.localStorage.getItem(StorageKeys.ProjDocs.Host.Web);

    if (!api || !web) {
      navigate("/auth/login");
      return;
    }

    supabase(api).auth.getClaims().then(({ data, error }) => {
      if (error) throw error.message;
      if (!data) {
        if (!mounted) return;
        navigate("/auth/login");
        return;
      }
      if (mounted) navigate("/organizations");
    }).catch(e => {
      if (!mounted) return;
      toast.error("Unable to authenticate!", {
        description: "An error occurred while logging in. Please sign-in again.",
      });
      console.error(e);
      navigate("/auth/login");
    });

    return () => {
      mounted = false;
    };
  }, []);

  return <></>;
}