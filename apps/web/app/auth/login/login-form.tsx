"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AuthTokenResponse } from "@supabase/auth-js";
import { Button } from "@packages/ui/components/button";
import { Input } from "@packages/ui/components/input";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { supabase } from "@apps/web/lib/supabase/client";
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@packages/ui/components/field";
import Logo from "@packages/ui/branding/logo/logo";


const passwordSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});
type PasswordFormValues = z.infer<typeof passwordSchema>;

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
  const [ showPassword, setShowPassword ] = useState(props.providers.length === 0);
  const params = useSearchParams();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      email: process.env.NODE_ENV === "development" ? "admin@projdocs.localhost" : "",
      password: process.env.NODE_ENV === "development" ? "c3bcc25f-c585-4a09-8730-6d62fae27657" : "",
    },
  });

  async function handlePasswordLogin({ email, password }: PasswordFormValues) {
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) toast.error("Unable to sign in", { description: error.message });
    else window.location.assign("/organizations");
  }

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
            <CardContent className="flex flex-col-reverse w-full p-0 md:flex-row md:items-stretch">

              <div className={"w-full md:w-1/2 flex flex-col gap-4 p-8"}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    {"Sign in to your account to continue"}
                  </p>
                </div>

                {!showPassword ? (
                  <div className={"w-full h-full items-center flex flex-col justify-between"}>
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

                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center w-full mt-3"
                      onClick={() => setShowPassword(true)}
                    >
                      {"Sign in with email & password"}
                    </button>
                  </div>
                ) : (
                  <>
                    <form onSubmit={form.handleSubmit(handlePasswordLogin)}>
                      <FieldGroup className="gap-3">
                        <Field>
                          <FieldLabel htmlFor="login-email">{"Email"}</FieldLabel>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            aria-invalid={!!form.formState.errors.email}
                            {...form.register("email")}
                          />
                          {form.formState.errors.email && (
                            <FieldError errors={[form.formState.errors.email]} />
                          )}
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="login-password">{"Password"}</FieldLabel>
                          <Input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            aria-invalid={!!form.formState.errors.password}
                            {...form.register("password")}
                          />
                          {form.formState.errors.password && (
                            <FieldError errors={[form.formState.errors.password]} />
                          )}
                        </Field>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={!form.formState.isValid || form.formState.isSubmitting}
                        >
                          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
                        </Button>
                      </FieldGroup>
                    </form>

                    {props.providers.length > 0 && (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center w-full"
                        onClick={() => setShowPassword(false)}
                      >
                        {"Sign in with a provider"}
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className={"w-full md:w-1/2 bg-muted"}>
                <Logo className={"w-full h-full p-10 py-20"}  />
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
