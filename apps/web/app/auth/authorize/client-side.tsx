"use client";


import { Spinner } from "@packages/ui/components/spinner";
import { JSX, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { useDebouncedCallback } from "use-debounce";
import { supabase } from "@apps/web/lib/supabase/client";
import { useRouter } from "next/navigation";



type Props = {
  apiBase: string;
}


const Loading = () => (
  <Spinner className="size-16" />
);

const None = () => (
  <Alert variant={"destructive"}>
    <AlertTitle>{"No Audience Specified!"}</AlertTitle>
    <AlertDescription>{"The `aud` search parameter is missing."}</AlertDescription>
  </Alert>
);

const Unhandled = () => (
  <Alert variant={"destructive"}>
    <AlertTitle>{"Audience Unauthorized!"}</AlertTitle>
    <AlertDescription>{"The `aud` search parameter is not authorized."}</AlertDescription>
  </Alert>
);

const Desktop = (props: Props) => {

  const router = useRouter();
  const [ status, setStatus ] = useState<boolean | undefined>();

  useEffect(() => {
    supabase().auth.getSession().then(session => {
      if (!session.data.session) return router.push(`/auth/login?next=${encodeURIComponent(window.location.toString())}`);
      const url = new URL(props.apiBase);
      url.pathname = "/v1/auth/authorize/desktop";

      fetch(url, {
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
      }).then(async (r) => {
        const response = await r.json();
        if (r.status !== 200) {
          throw new Error(response.error);
        }

        const redirect = new URL("projdocs:///auth/callback");
        redirect.searchParams.set("token", response.data);
        redirect.searchParams.set("web-host", window.location.origin);
        redirect.searchParams.set("api-host", props.apiBase);

        window.location.href = redirect.toString();
        setStatus(true);
      }).catch(e => {
        console.error(e);
      });
    });
  }, []);

  if (status === undefined) return <Loading />;
  else if (!status) return (
    <Alert variant={"destructive"}>
      <AlertTitle>{"Unexpected Error Occurred!"}</AlertTitle>
      <AlertDescription>{"An unexpected error occurred while obtaining an access token. Check the browser's console for more details."}</AlertDescription>
    </Alert>
  );
  return (
    <Alert>
      <AlertTitle>{"Success!"}</AlertTitle>
      <AlertDescription>{"You can now close this window."}</AlertDescription>
    </Alert>
  );
};

const Handlers = (props: Props & {
  aud: string | null | undefined;
}): JSX.Element => {
  switch (props.aud) {
    case "desktop":
      return (<Desktop {...props} />);
    case undefined:
      return (<Loading />);
    case null:
      return (<None />);
    default:
      return (<Unhandled />);
  }
};

export default function(props: Props) {

  const [ aud, _setAud ] = useState<string | null | undefined>(undefined);
  const setAud = useDebouncedCallback<(v: typeof aud) => unknown>(v => _setAud(v), 250);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAud(params.get("aud"));
  }, [ typeof window ]);

  return (
    <div className={"w-full h-full flex flex-col items-center justify-center"}>
      <div className={"w-md flex flex-col items-center justify-center"}>
        <Handlers aud={aud} {...props} />
      </div>
    </div>
  );

}