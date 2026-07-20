import Logo from "@packages/ui/branding/logo/logo";
import { StarfieldBackground } from "@packages/ui/backgrounds/stars";
import { Spinner } from "@packages/ui/components/spinner";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { StorageKeys } from "@apps/desktop/lib/storage";
import { useNavigate } from "react-router";
import { supabase } from "@apps/desktop/lib/supabase";
import { toast } from "sonner";



export default function AuthCallback() {

  const navigate = useNavigate();
  const [ searchParams ] = useSearchParams();
  const [ error, setError ] = useState<string | undefined>();

  useEffect(() => {

    const token = searchParams.get("token");
    if (!token) {
      setError("`token` is missing");
      return;
    }

    const web = searchParams.get("web-host");
    if (!web) {
      setError("`web-host` is missing");
      return;
    }

    const api = searchParams.get("api-host");
    if (!api) {
      setError("`api-host` is missing");
      return;
    }

    supabase(api).auth.verifyOtp({
      token_hash: token,
      type: "email",
    }).then(({ data, error }) => {
      if (error) throw error.message;
      if (!data.user) {
        toast.error("Authentication failed!", {
          description: "No user was present.",
        });
        return;
      }
      window.localStorage.setItem(StorageKeys.ProjDocs.Host.API, api);
      window.localStorage.setItem(StorageKeys.ProjDocs.Host.Web, web);
      navigate("/");
    }).catch(e => {
      toast.error("Unable to authenticate!", {
        description: "An error occurred while logging in. Please sign-in again.",
      });
      console.error(e);
      navigate("/auth/login");
    });

  }, []);

  return (
    <StarfieldBackground>

      <div className="flex h-dvh w-dvw flex-col items-center">
        <div className="flex-1 h-1/3" />
        <Logo className="w-1/3" />
        <div className="flex flex-1 flex-col items-center pt-8 gap-1">
          {error === undefined ? (
            <Spinner className={"size-20"} />
          ) : (
            <Alert>
              <AlertTitle>{"Invalid Callback!"}</AlertTitle>
              <AlertDescription>{`The callback is invalid: ${error}.`}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

    </StarfieldBackground>
  );
}