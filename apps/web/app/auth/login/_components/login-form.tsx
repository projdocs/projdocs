"use client";

import { useEffect, useState } from "react";
import type { AuthTokenResponse, CustomOAuthProvider } from "@supabase/auth-js";
import { Button } from "@workspace/ui/components/button";
import { createBrowserClient } from "@supabase/ssr";
import { H1, P } from "@workspace/ui/components/typography";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { supabase } from "@/lib/supabase/client";
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation";
import { navigate } from "next/dist/client/components/segment-cache/navigation";

interface LoginFormProps {
  providers: Pick<CustomOAuthProvider, "id" | "identifier" | "name">[];
  supabase: {
    url: string;
    publishableKey: string;
  };
}

const ExchangePKCECode = (
  props: LoginFormProps["supabase"] & {
    params: ReadonlyURLSearchParams;
  }
) => {
  const router = useRouter();
  const [state, setState] = useState<AuthTokenResponse["error"]>();

  // detect session code
  useEffect(() => {
    let mounted = true;
    if (props.params.has("code"))
      supabase()
        .auth.exchangeCodeForSession(props.params.get("code")!)
        .then((response: AuthTokenResponse) => {
          if (response.error) setState(response.error);
          else if(props.params.has("next")) {
            try {
              const url = new URL(props.params.get("next")!);
              if(url.hostname === "localhost" ) url.hostname = "127.0.0.1";
              console.log(url.toString())
              window.location.assign(url);
            } catch (e) {
              console.error("`next` threw an error:", e)
              router.push("/organizations");
            }
          }
          else router.push("/organizations");
        });
    return () => {
      mounted = false;
    }
  }, []);

  if (state)
    return (
      <Card className={"w-full max-w-sm"}>
        <CardHeader>
          <CardTitle>{"Unexpected error!"}</CardTitle>
          <CardDescription>
            {
              "An unexpected error occurred while exchanging the authentication code!"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>{state.message}</CardContent>
      </Card>
    );

  return <></>;
};

export function LoginForm(props: LoginFormProps) {
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
  const params = useSearchParams();

  return (
    <div className="w-full max-w-sm space-y-6">
      {params.has("code") ? (
        <ExchangePKCECode params={params} {...props.supabase} />
      ) : (
        <>
          <div className="space-y-1 text-center">
            <H1 className="text-2xl font-semibold tracking-tight">Sign in</H1>
            <P className="text-sm text-muted-foreground">
              {"Select an authentication provider to continue"}
            </P>
          </div>

          <div className="space-y-2">
            {props.providers.map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                className="w-full capitalize"
                disabled={providerLoading === provider.identifier}
                onClick={async () => {
                  setProviderLoading(provider.identifier);

                  const { error } = await createBrowserClient(
                    props.supabase.url,
                    props.supabase.publishableKey
                  ).auth.signInWithOAuth({
                    provider: provider.identifier as never,
                    options: {
                      redirectTo: window.location.href,
                    },
                  });

                  if (error) {
                    toast.error(error.message);
                    console.error(error);
                    setProviderLoading(null);
                  }
                }}
              >
                {providerLoading === provider.identifier
                  ? "Redirecting…"
                  : provider.name}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
