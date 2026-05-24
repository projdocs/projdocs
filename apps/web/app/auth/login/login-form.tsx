"use client";

import { useEffect, useState } from "react";
import type { AuthTokenResponse } from "@supabase/auth-js";
import { Button } from "@packages/ui/components/button";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { supabase } from "@apps/web/lib/supabase/client";
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation";
import { Field, FieldDescription, FieldGroup } from "@packages/ui/components/field";
import Logo from "@packages/ui/branding/logo/logo";



interface LoginFormProps {
  providers: ReadonlyArray<{ display: string; identifier: string }>;
  supabase: {
    url: string;
    publishableKey: string;
  };
}

const ExchangePKCECode = (
  props: LoginFormProps["supabase"] & {
    params: ReadonlyURLSearchParams;
  },
) => {
  const router = useRouter();
  const [ state, setState ] = useState<AuthTokenResponse["error"]>();

  // detect session code
  useEffect(() => {
    if (props.params.has("code"))
      supabase()
        .auth.exchangeCodeForSession(props.params.get("code")!)
        .then((response: AuthTokenResponse) => {
          if (response.error) setState(response.error);
          else if (props.params.has("next")) {
            try {
              const url = new URL(props.params.get("next")!);
              if (url.hostname === "localhost") url.hostname = "127.0.0.1";
              console.log(url.toString());
              window.location.assign(url);
            } catch (e) {
              console.error("`next` threw an error:", e);
              router.push("/organizations");
            }
          } else router.push("/organizations");
        });
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
  const [ providerLoading, setProviderLoading ] = useState<string | null>(null);
  const params = useSearchParams();

  useEffect(() => {
    if (params.has("error"))
      toast.error(`Authentication error: \`${params.get("error_code")}\``, {
        description: params.get("error_description"),
      });
  }, []);

  return (
    <div className="w-full max-w-sm md:max-w-4xl">
      {params.has("code") ? (
        <ExchangePKCECode params={params} {...props.supabase} />
      ) : (
        <div className={"flex flex-col gap-6"}>
          <Card className="overflow-hidden p-0">
            <CardContent className="flex flex-col-reverse w-full p-0 md:flex-row items-center">

              <div className={"w-full md:w-1/2 flex flex-col gap-4 p-8"}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    {"Select an authentication provider to continue"}
                  </p>
                </div>

                <div className={"w-full flex flex-col gap-2"}>
                  {props.providers.map((provider) => (
                    <Button
                      key={provider.identifier}
                      variant="outline"
                      className="w-full capitalize"
                      disabled={providerLoading === provider.identifier}
                      onClick={async () => {
                        setProviderLoading(provider.identifier);

                        const { error } = await createBrowserClient(
                          props.supabase.url,
                          props.supabase.publishableKey,
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
                        : provider.display}
                    </Button>
                  ))}
                </div>
              </div>

              <div className={"w-full md:w-1/2"}>
                <Logo className={"bg-muted w-full h-full p-10 py-20"}  />
              </div>


            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
            and <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </div>
      )}
    </div>
  );
}
