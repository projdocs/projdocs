import { useEffect } from "react";
import { StorageKeys } from "@apps/desktop/lib/storage";
import { supabase } from "@apps/desktop/lib/supabase";
import { useNavigate } from "react-router";



export default function AuthLogout() {

  const navigate = useNavigate();

  useEffect(() => {
    let mounted: boolean = true;
    supabase().auth.signOut().then(() => {
      window.localStorage.removeItem(StorageKeys.ProjDocs.Host.API);
      window.localStorage.removeItem(StorageKeys.ProjDocs.Host.Web);
      if(mounted) navigate("/");
    });
    return () => {
      mounted = false;
    }
  }, []);

  return (
    <></>
  )

}