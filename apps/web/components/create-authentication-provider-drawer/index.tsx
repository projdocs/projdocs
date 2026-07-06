"use client";

import * as React from "react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@packages/ui/components/drawer";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@packages/ui/components/field";
import { Input } from "@packages/ui/components/input";
import { Button } from "@packages/ui/components/button";
import { Switch } from "@packages/ui/components/switch";
import { Badge } from "@packages/ui/components/badge";
import { Tabs, TabsList, TabsTrigger } from "@packages/ui/components/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@packages/ui/components/collapsible";
import { CheckIcon, ChevronDownIcon, CopyIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@apps/web/lib/supabase/client";
import {
  CustomProviderFormValues,
  customProviderSchema,
} from "@apps/web/components/create-authentication-provider-drawer/form";
import { CustomOAuthProvider } from "@supabase/auth-js";



interface CreateAuthenticationProviderDrawerProps {
  trigger?: ReactNode;
  onCreate?: (row: CustomOAuthProvider) => unknown;
}

export function CreateAuthenticationProviderDrawer(props: CreateAuthenticationProviderDrawerProps) {
  const CALLBACK_URL = `${window.projdocs.PROJDOCS_API_URL}/public/supabase/proxy/auth/v1/callback`;

  const [ copied, setCopied ] = useState(false);
  const [ advancedOpen, setAdvancedOpen ] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  const form = useForm<CustomProviderFormValues>({
    // @ts-expect-error
    resolver: zodResolver(customProviderSchema),
    defaultValues: {
      provider_type: "oidc" as "oauth2" | "oidc",
      name: "",
      client_id: "",
      client_secret: "",
      scopes: [],
      pkce_enabled: true,
      email_optional: false,
      acceptable_client_ids: [],
      issuer: "",
      discovery_url: "",
      skip_nonce_check: false,
      authorization_url: "",
      token_url: "",
      user_info_url: "",
    },
  });

  const providerType = form.watch("provider_type");

  useEffect(() => {
    if (providerType === "oauth2") {
      form.resetField("authorization_url" as never);
      form.resetField("token_url" as never);
      form.resetField("user_info_url" as never);
    } else {
      form.resetField("issuer" as never);
      form.resetField("discovery_url" as never);
      form.setValue("skip_nonce_check" as never, false as never);
    }
  }, [ providerType, form ]);

  function handleCopy() {
    navigator.clipboard.writeText(CALLBACK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function handleSubmit(values: CustomProviderFormValues) {
    try {
      const { error, data } = await supabase().auth.admin.customProviders.createProvider({
        ...values,
        identifier: `custom:${crypto.randomUUID()}`,
      });

      if (error) throw error.message;

      props.onCreate && props.onCreate(data);
      toast.success(`Provider "${values.name}" created and enabled.`);
      closeButton.current?.click();
      form.reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : typeof err === "string" ? err : "Failed to create provider.",
      );
    }
  }

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        {props.trigger ?? (
          <Button>
            <PlusIcon />
            {"Add Provider"}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="fixed inset-y-0 right-0 flex h-full w-full max-w-lg flex-col rounded-none">

        <DrawerHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <DrawerTitle>Add custom provider</DrawerTitle>
            <Badge variant="secondary">
              {providerType === "oauth2" ? "OAuth2" : "OIDC"}
            </Badge>
          </div>
          <DrawerDescription>
            Configure a new OAuth2 or OIDC identity provider. Copy the callback
            URL below and register it with your IdP before saving.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* ── Callback URL ── */}
          <div
            className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm font-mono text-muted-foreground">
            <span className="flex-1 truncate">{CALLBACK_URL}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleCopy}
              aria-label="Copy callback URL"
            >
              {copied ? (
                <CheckIcon className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <CopyIcon className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          <form
            id="provider-form"
            // @ts-expect-error
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
          >
            <FieldGroup className="gap-4">

              {/* ── Provider type ── */}
              <Controller
                name="provider_type"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Configuration method</FieldLabel>
                    <Tabs value={field.value} onValueChange={field.onChange}>
                      <TabsList className="w-full">
                        <TabsTrigger value="oauth2" className="flex-1">
                          Manual (OAuth2)
                        </TabsTrigger>
                        <TabsTrigger value="oidc" className="flex-1">
                          Auto-discovery (OIDC)
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </Field>
                )}
              />

              {/* ── Display name ── */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="provider-name">Display name</FieldLabel>
                    <Input
                      {...field}
                      id="provider-name"
                      placeholder="My Identity Provider"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[ fieldState.error ]} />
                    )}
                  </Field>
                )}
              />

              {/* ── Client credentials ── */}
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="client_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="provider-client-id">Client ID</FieldLabel>
                      <Input
                        {...field}
                        id="provider-client-id"
                        placeholder="your-client-id"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[ fieldState.error ]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="client_secret"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="provider-client-secret">Client secret</FieldLabel>
                      <Input
                        {...field}
                        id="provider-client-secret"
                        type="password"
                        placeholder="••••••••••"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[ fieldState.error ]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {/* ── OAuth2 endpoints ── */}
              {providerType === "oauth2" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Endpoints
                  </p>
                  <Controller
                    name={"authorization_url" as never}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="provider-auth-url">Authorization URL</FieldLabel>
                        <Input
                          {...field}
                          id="provider-auth-url"
                          type="url"
                          placeholder="https://idp.example.com/oauth2/authorize"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[ fieldState.error ]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name={"token_url" as never}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="provider-token-url">Token URL</FieldLabel>
                        <Input
                          {...field}
                          id="provider-token-url"
                          type="url"
                          placeholder="https://idp.example.com/oauth2/token"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[ fieldState.error ]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name={"user_info_url" as never}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="provider-userinfo-url">UserInfo URL</FieldLabel>
                        <Input
                          {...field}
                          id="provider-userinfo-url"
                          type="url"
                          placeholder="https://idp.example.com/oauth2/userinfo"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[ fieldState.error ]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              )}

              {/* ── OIDC discovery ── */}
              {providerType === "oidc" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Discovery
                  </p>
                  <Controller
                    name={"issuer" as never}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="provider-issuer">Issuer URL</FieldLabel>
                        <Input
                          {...field}
                          id="provider-issuer"
                          type="url"
                          placeholder="https://idp.example.com"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                        />
                        <FieldDescription>
                          Discovery document fetched from{" "}
                          <code className="text-xs">
                            {"{issuer}"}/.well-known/openid-configuration
                          </code>
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[ fieldState.error ]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              )}

              {/* ── Advanced ── */}
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto gap-1 px-0 text-xs font-medium text-muted-foreground"
                  >
                    <ChevronDownIcon
                      className={`h-3.5 w-3.5 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                    />
                    Advanced options
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-3">

                  {/* Scopes */}
                  <Controller
                    name="scopes"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="provider-scopes">Scopes</FieldLabel>
                        <Input
                          id="provider-scopes"
                          value={field.value?.join(" ") ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? e.target.value.split(" ").filter(Boolean)
                                : [],
                            )
                          }
                          placeholder="profile email"
                          autoComplete="off"
                        />
                        <FieldDescription>
                          Space-separated.{" "}
                          {providerType === "oidc" && (
                            <>
                              <code className="text-xs">openid</code> is always
                              included automatically.
                            </>
                          )}
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[ fieldState.error ]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* PKCE */}
                  <Controller
                    name="pkce_enabled"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                        <div className="flex-1">
                          <FieldLabel htmlFor="provider-pkce">PKCE</FieldLabel>
                          <FieldDescription>
                            Recommended. Disable only if the IdP does not support it.
                          </FieldDescription>
                        </div>
                        <Switch
                          id="provider-pkce"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />

                  {/* Email optional */}
                  <Controller
                    name="email_optional"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                        <div className="flex-1">
                          <FieldLabel htmlFor="provider-email-optional">
                            Email optional
                          </FieldLabel>
                          <FieldDescription>
                            Allow sign-in without a returned email address.
                          </FieldDescription>
                        </div>
                        <Switch
                          id="provider-email-optional"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />

                  {/* Skip nonce check (OIDC only) */}
                  {providerType === "oidc" && (
                    <Controller
                      name={"skip_nonce_check" as never}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                          <div className="flex-1">
                            <FieldLabel htmlFor="provider-skip-nonce">
                              Skip nonce check
                            </FieldLabel>
                            <FieldDescription>
                              Use only for providers that do not support nonce.
                            </FieldDescription>
                          </div>
                          <Switch
                            id="provider-skip-nonce"
                            checked={(field as never as { value: boolean }).value}
                            onCheckedChange={field.onChange}
                            aria-invalid={fieldState.invalid}
                          />
                        </Field>
                      )}
                    />
                  )}

                  {/* Additional client IDs */}
                  <Controller
                    name="acceptable_client_ids"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="provider-acceptable-ids">
                          Additional client IDs
                        </FieldLabel>
                        <Input
                          id="provider-acceptable-ids"
                          value={field.value?.join(" ") ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? e.target.value.split(" ").filter(Boolean)
                                : [],
                            )
                          }
                          placeholder="ios-client-id android-client-id"
                          autoComplete="off"
                        />
                        <FieldDescription>
                          Space-separated. Accepted for audience validation in
                          OIDC ID tokens (multi-platform apps).
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[ fieldState.error ]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* Discovery URL override (OIDC only) */}
                  {providerType === "oidc" && (
                    <Controller
                      name={"discovery_url" as never}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="provider-discovery-url">
                            Discovery URL override
                          </FieldLabel>
                          <Input
                            {...field}
                            id="provider-discovery-url"
                            type="url"
                            placeholder="https://idp.example.com/.well-known/openid-configuration"
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                          />
                          <FieldDescription>
                            Override only if the provider uses a non-standard
                            discovery document location.
                          </FieldDescription>
                          {fieldState.invalid && (
                            <FieldError errors={[ fieldState.error ]} />
                          )}
                        </Field>
                      )}
                    />
                  )}
                </CollapsibleContent>
              </Collapsible>

            </FieldGroup>
          </form>
        </div>

        <DrawerFooter className="border-t px-6 py-4">
          <div className="flex justify-end gap-2">
            <DrawerClose asChild>
              <Button ref={closeButton} type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
            <Button
              type="submit"
              form="provider-form"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating…" : "Create and enable provider"}
            </Button>
          </div>
        </DrawerFooter>

      </DrawerContent>
    </Drawer>
  );
}