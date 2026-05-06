"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@packages/ui/components/button";
import { Input } from "@packages/ui/components/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@packages/ui/components/field";
import {
  CheckIcon,
  ClipboardIcon,
  Eye,
  EyeOff,
  InfoIcon,
  PlusIcon,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui/components/dialog";
import { CustomProviderResponse } from "@supabase/auth-js";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <CheckIcon className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <ClipboardIcon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function HintField({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [hintOpen, setHintOpen] = useState(false);
  return (
    <Field>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
        {hint && (
          <button
            type="button"
            onClick={() => setHintOpen((v) => !v)}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label={hintOpen ? "Hide hint" : "Show hint"}
          >
            <InfoIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {children}
      {error}
      {hint && (
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-in-out"
          style={{ gridTemplateRows: hintOpen ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="space-y-1 pt-1">{hint}</div>
          </div>
        </div>
      )}
    </Field>
  );
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Connection name is required.")
    .regex(
      /^[A-Za-z0-9]([A-Za-z0-9.\-]*[A-Za-z0-9])?$/,
      "Must start and end with a letter or number, and contain only letters, numbers, periods, or hyphens."
    ),
  issuer: z.url({
    protocol: /^https?$/,
    hostname: z.regexes.domain,
    error: "Enter a valid https URL.",
  }),
  client_id: z.string().min(1, "Client ID is required."),
  client_secret: z.string().min(1, "Client secret is required."),
});

export type CreateProviderForm = z.infer<typeof formSchema>;

export default function OIDCConnectionForm(props: {
  KONG_URL: string | undefined;
  onCreateAction: (f: CreateProviderForm) => Promise<CustomProviderResponse>;
  refreshEvent: string;
}) {
  const [open, setOpen] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      issuer: "",
      client_id: "",
      client_secret: "",
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSubmitted(false);
      reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={!props.KONG_URL}>
          <PlusIcon />
          {"OIDC Connection"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <ShieldCheck className="h-12 w-12 text-green-500" />
            <p className="text-lg font-medium">Connection saved</p>
            <p className="text-center text-sm text-muted-foreground">
              Your OIDC provider has been configured successfully.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Edit connection
              </Button>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Custom OIDC connection</DialogTitle>
              <DialogDescription>
                Configure an OpenID Connect identity provider for your
                organisation.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(async (formData) => {
                const { error } = await props.onCreateAction(formData);
                if (error)
                  toast.error("Unable to Create Provider", {
                    description: error.message,
                  });
                else {
                  useEventListener.RemoteDispatch<null>(
                    props.refreshEvent,
                    null
                  );
                  setOpen(false);
                  reset();
                }
              })}
            >
              <div className="space-y-0">
                <FieldSet>
                  <FieldLegend>General</FieldLegend>
                  <FieldGroup>
                    <HintField
                      label="Connection name"
                      htmlFor="name"
                      error={
                        errors.name && (
                          <FieldError>{errors.name.message}</FieldError>
                        )
                      }
                      hint={
                        <>
                          <FieldDescription>
                            This value will be shown to users on the login page
                            and used to identify this sign-in provider.
                          </FieldDescription>
                          <FieldDescription>
                            Must start and end with a letter or number. May
                            contain letters, numbers, periods (.) and hyphens
                            (-).
                          </FieldDescription>
                        </>
                      }
                    >
                      <Input
                        id="name"
                        placeholder="Custom SSO"
                        aria-invalid={!!errors.name}
                        autoComplete="off"
                        {...register("name")}
                      />
                    </HintField>
                  </FieldGroup>
                </FieldSet>

                <FieldSeparator className="my-6" />

                <FieldSet>
                  <FieldLegend>Provider credentials</FieldLegend>
                  <FieldGroup>
                    <HintField label={"Authorized Redirect URI"}>
                      <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                        <code className="flex-1 truncate font-mono text-sm text-foreground">
                          {`${props.KONG_URL}/auth/v1/callback`}
                        </code>
                        <CopyButton
                          value={`${props.KONG_URL}/auth/v1/callback`}
                        />
                      </div>
                    </HintField>

                    <HintField
                      label="Issuer URL"
                      htmlFor="issuer"
                      error={
                        errors.issuer && (
                          <FieldError>{errors.issuer.message}</FieldError>
                        )
                      }
                      hint={
                        <FieldDescription>
                          The base URL of your identity provider. Must begin
                          with https://.
                        </FieldDescription>
                      }
                    >
                      <Input
                        id="issuer"
                        placeholder="https://auth.example.com"
                        aria-invalid={!!errors.issuer}
                        autoComplete="off"
                        {...register("issuer")}
                      />
                    </HintField>

                    <Field>
                      <FieldLabel htmlFor="client_id">Client ID</FieldLabel>
                      <Input
                        id="client_id"
                        placeholder="your-client-id"
                        aria-invalid={!!errors.client_id}
                        autoComplete="off"
                        {...register("client_id")}
                      />
                      {errors.client_id && (
                        <FieldError>{errors.client_id.message}</FieldError>
                      )}
                    </Field>

                    <HintField
                      label="Client secret"
                      htmlFor="client_secret"
                      error={
                        errors.client_secret && (
                          <FieldError>
                            {errors.client_secret.message}
                          </FieldError>
                        )
                      }
                      hint={
                        <FieldDescription>
                          Stored encrypted at rest. Never logged or exposed
                          after saving.
                        </FieldDescription>
                      }
                    >
                      <div className="relative">
                        <Input
                          id="client_secret"
                          type={showSecret ? "text" : "password"}
                          placeholder="your-client-secret"
                          aria-invalid={!!errors.client_secret}
                          autoComplete="new-password"
                          className="pr-10"
                          {...register("client_secret")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret((v) => !v)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={
                            showSecret ? "Hide secret" : "Show secret"
                          }
                        >
                          {showSecret ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </HintField>
                  </FieldGroup>
                </FieldSet>
              </div>

              <DialogFooter className="mt-6 border-t pt-4">
                <Button type="button" variant="ghost" onClick={() => reset()}>
                  Reset
                </Button>
                <Button type="submit">Save connection</Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
