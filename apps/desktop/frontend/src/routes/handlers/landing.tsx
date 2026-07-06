import { useNavigate } from "react-router";
import { JSX, useEffect } from "react";
import { StorageKeys } from "@apps/desktop/lib/storage";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { toast } from "sonner";



export default function Landing(): JSX.Element {

  const navigate = useNavigate();
  useEffect(() => {

    const token = window.localStorage.getItem(StorageKeys.ProjDocs.Auth.Session);
    const api = window.localStorage.getItem(StorageKeys.ProjDocs.Host.API);
    const web = window.localStorage.getItem(StorageKeys.ProjDocs.Host.Web);

    if (!token || !api || !web) {
      navigate("/auth/login");
      return;
    }

    const jwks = createRemoteJWKSet(
      new URL(`${api}/public/supabase/proxy/auth/v1/.well-known/jwks.json`),
    );

    jwtVerify(token, jwks)
      .then(() => {
        navigate("/organizations");
      })
      .catch(e => {
        toast.error("Unable to authenticate!", {
          description: "An error occurred while logging in. Please sign-in again.",
        });
        console.error(e);
        navigate("/auth/login");
      });
  }, []);

  return <></>;
}