"use client";

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
import { Button } from "@packages/ui/components/button";
import { FileJsonIcon, PlusIcon } from "lucide-react";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@packages/ui/components/field";
import { Input } from "@packages/ui/components/input";
import { Textarea } from "@packages/ui/components/textarea";
import { Controller, useForm } from "react-hook-form";
import { Tabs, TabsList, TabsTrigger } from "@packages/ui/components/tabs";
import { z } from "zod";
import { ChangeEvent, DragEvent, ReactNode, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { StorageProviderTypes } from "@packages/shared/utilities/storage/type";
import { Enums } from "@packages/supabase";
import { toast } from "sonner";
import { supabase } from "@apps/web/lib/supabase/client";
import { cn } from "@packages/ui/lib/utils";

// S3
export const S3DataSchema = z.object({
  bucket: z.string().min(1, "Bucket name is required"),
  accessKeyId: z.string().min(1, "Access key ID is required"),
  secretKey: z.string().min(1, "Secret key is required"),
  endpoint: z.string().url("Must be a valid URL"),
  region: z.string().min(1, "Region is required"),
}).strict();
export type S3Data = z.infer<typeof S3DataSchema>;

// Google Drive
export const GoogleDriveJsonKeySchema = z.object({
  type: z.literal("service_account"),
  project_id: z.string().min(1),
  private_key_id: z.string().min(1),
  private_key: z.string().startsWith("-----BEGIN PRIVATE KEY-----"),
  client_email: z.string().regex(/^[^@]+@[^@]+\.iam\.gserviceaccount\.com$/),
  client_id: z.string().min(1),
  auth_uri: z.literal("https://accounts.google.com/o/oauth2/auth"),
  token_uri: z.literal("https://oauth2.googleapis.com/token"),
  auth_provider_x509_cert_url: z.literal("https://www.googleapis.com/oauth2/v1/certs"),
  client_x509_cert_url: z.string().regex(/^https:\/\/www\.googleapis\.com\/robot\/v1\/metadata\/x509\//),
  universe_domain: z.literal("googleapis.com"),
}).strict();

export const GoogleDriveDataSchema = z.object({
  parentID: z.string().min(1),
  jsonKey: GoogleDriveJsonKeySchema,
}).strict();
export type GoogleDriveData = z.infer<typeof GoogleDriveDataSchema>;

export const StorageProviderDataSchema = z.discriminatedUnion("type", [
  z.object({
    display: z.string().min(1, "Display name is required"),
    type: z.literal("GOOGLE_DRIVE" satisfies Enums<"settings_storage_type">),
    googleDrive: GoogleDriveDataSchema.optional(),
  }),
  z.object({
    display: z.string().min(1, "Display name is required"),
    type: z.literal("S3" satisfies Enums<"settings_storage_type">),
    s3: S3DataSchema.optional(),
  }),
]);

type StorageProviderData = z.infer<typeof StorageProviderDataSchema>;

const defaultStorageProviderData: StorageProviderData = {
  display: "",
  type: "S3" as "S3" | "GOOGLE_DRIVE",
  s3: {
    bucket: "",
    accessKeyId: "",
    secretKey: "",
    endpoint: "",
    region: "",
  },
  googleDrive: {
    parentID: "",
    jsonKey: {
      type: "service_account",
      project_id: "",
      private_key_id: "",
      private_key: "",
      client_email: "",
      client_id: "",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "",
      universe_domain: "googleapis.com",
    },
  },
};

export const CreateStorageProviderDrawer = (props: {
  trigger?: ReactNode;
  onCreateAction?: () => unknown;
}) => {

  const form = useForm<StorageProviderData>({
    resolver: zodResolver(StorageProviderDataSchema),
    defaultValues: defaultStorageProviderData,
  });

  const closeButton = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const providerType = form.watch("type");

  const [ googleKeyMode, setGoogleKeyMode ] = useState<"dropzone" | "fields">("dropzone");
  const [ isDragging, setIsDragging ] = useState(false);

  useEffect(() => {
    if (providerType !== "GOOGLE_DRIVE") {
      setGoogleKeyMode("dropzone");
    }
  }, [ providerType ]);

  function parseKeyFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const result = GoogleDriveJsonKeySchema.safeParse(parsed);
        if (!result.success) {
          toast.error("Invalid service account key file. Make sure you downloaded the JSON key from Google Cloud Console.");
          return;
        }
        form.setValue("googleDrive.jsonKey", result.data, { shouldValidate: true });
        setGoogleKeyMode("fields");
      } catch {
        toast.error("Failed to parse key file — make sure it's valid JSON.");
      }
    };
    reader.readAsText(file);
  }

  async function handleSubmit(values: StorageProviderData) {

    const id = toast.loading("Creating provider...");

    try {

      let data;
      const type = values.type;
      switch (type) {
        case "S3":
          data = values.s3;
          break;
        case "GOOGLE_DRIVE":
          data = values.googleDrive;
          break;
        default:
          throw `Unhandled type: ${type}`;
      }

      const { error } = await supabase()
        .from("storage_providers")
        .insert({
          display: values.display,
          type: values.type,
          data,
        });
      if (error) throw error.message;

      toast.success(`Provider "${values.display}" created!`, { id });
      props.onCreateAction?.();
      closeButton.current?.click();
      form.reset();
      setGoogleKeyMode("dropzone");

    } catch (e) {
      console.error(e);
      toast.error("Failed to create provider!", {
        id,
        description: typeof e === "string" ? e : "Check the browser console for more details.",
      });
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
            <DrawerTitle>Add storage provider</DrawerTitle>
          </div>
          <DrawerDescription>
            Configure a new S3 or Google Drive backend.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <form
            id="provider-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
          >
            <FieldGroup className="gap-4">

              <Controller
                name="type"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Provider type</FieldLabel>
                    <Tabs value={field.value} onValueChange={field.onChange}>
                      <TabsList className="w-full">
                        {Object.keys(StorageProviderTypes).filter(k => k !== "BUILT_IN" satisfies Enums<"settings_storage_type">).map(key => (
                          <TabsTrigger key={key} value={key} className="flex-1">
                            {StorageProviderTypes[key as Enums<"settings_storage_type">]}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </Field>
                )}
              />

              <Controller
                name="display"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="provider-display">Display name</FieldLabel>
                    <Input
                      {...field}
                      id="provider-display"
                      placeholder={providerType === "GOOGLE_DRIVE" ? "My Google Drive" : "My S3 Bucket"}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[ fieldState.error ]} />
                    )}
                  </Field>
                )}
              />

              {/* ── S3 ── */}
              {providerType === "S3" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    S3 Configuration
                  </p>

                  <Controller
                    name="s3.endpoint"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="s3-endpoint">Endpoint URL</FieldLabel>
                        <Input
                          {...field}
                          id="s3-endpoint"
                          type="url"
                          placeholder="https://s3.amazonaws.com"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                        />
                        <FieldDescription>
                          For AWS use{" "}
                          <code className="text-xs">https://s3.amazonaws.com</code>.
                          For other providers, use their S3-compatible endpoint.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[ fieldState.error ]} />
                        )}
                      </Field>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Controller
                      name="s3.bucket"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="s3-bucket">Bucket</FieldLabel>
                          <Input
                            {...field}
                            id="s3-bucket"
                            placeholder="my-bucket"
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
                      name="s3.region"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="s3-region">Region</FieldLabel>
                          <Input
                            {...field}
                            id="s3-region"
                            placeholder="us-east-1"
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

                  <div className="grid grid-cols-2 gap-3">
                    <Controller
                      name="s3.accessKeyId"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="s3-access-key">Access key ID</FieldLabel>
                          <Input
                            {...field}
                            id="s3-access-key"
                            placeholder="AKIAIOSFODNN7EXAMPLE"
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
                      name="s3.secretKey"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="s3-secret-key">Secret key</FieldLabel>
                          <Input
                            {...field}
                            id="s3-secret-key"
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
                </div>
              )}

              {/* ── Google Drive ── */}
              {providerType === "GOOGLE_DRIVE" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Google Drive Configuration
                  </p>

                  <Controller
                    name="googleDrive.parentID"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="gdrive-parent-id">Parent folder ID</FieldLabel>
                        <Input
                          {...field}
                          id="gdrive-parent-id"
                          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                        />
                        <FieldDescription>
                          The folder ID from the Google Drive URL where files will be stored.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[ fieldState.error ]} />
                        )}
                      </Field>
                    )}
                  />

                  <div className="flex flex-col gap-1.5">

                    {googleKeyMode === "dropzone" ? (
                      <>
                        <p className="text-sm font-medium leading-none">Service account key</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".json,application/json"
                          className="hidden"
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0];
                            if (file) parseKeyFile(file);
                            e.target.value = "";
                          }}
                        />
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e: DragEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files[0];
                            if (file) parseKeyFile(file);
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
                            isDragging
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-muted-foreground/25 hover:border-muted-foreground/40",
                          )}
                        >
                          <FileJsonIcon className="h-7 w-7 text-muted-foreground" />
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">Drop JSON key file here</p>
                            <p className="text-xs text-muted-foreground">or click to browse</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGoogleKeyMode("fields")}
                          className="mt-0.5 w-fit text-xs text-muted-foreground underline-offset-2 hover:underline"
                        >
                          Enter details manually
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Controller
                          name="googleDrive.jsonKey.client_email"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="gdrive-client-email">Service account email</FieldLabel>
                              <Input
                                {...field}
                                id="gdrive-client-email"
                                placeholder="my-sa@my-project.iam.gserviceaccount.com"
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[ fieldState.error ]} />
                              )}
                            </Field>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <Controller
                            name="googleDrive.jsonKey.project_id"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="gdrive-project-id">Project ID</FieldLabel>
                                <Input
                                  {...field}
                                  id="gdrive-project-id"
                                  placeholder="my-project-123"
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
                            name="googleDrive.jsonKey.client_id"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="gdrive-client-id">Client ID</FieldLabel>
                                <Input
                                  {...field}
                                  id="gdrive-client-id"
                                  placeholder="123456789012345678901"
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

                        <Controller
                          name="googleDrive.jsonKey.private_key_id"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="gdrive-private-key-id">Private key ID</FieldLabel>
                              <Input
                                {...field}
                                id="gdrive-private-key-id"
                                placeholder="a1b2c3d4e5f6..."
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
                          name="googleDrive.jsonKey.private_key"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="gdrive-private-key">Private key</FieldLabel>
                              <Textarea
                                {...field}
                                id="gdrive-private-key"
                                placeholder={"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"}
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                                className="font-mono text-xs"
                                rows={5}
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[ fieldState.error ]} />
                              )}
                            </Field>
                          )}
                        />

                        <Controller
                          name="googleDrive.jsonKey.client_x509_cert_url"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="gdrive-cert-url">Client cert URL</FieldLabel>
                              <Input
                                {...field}
                                id="gdrive-cert-url"
                                type="url"
                                placeholder="https://www.googleapis.com/robot/v1/metadata/x509/..."
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[ fieldState.error ]} />
                              )}
                            </Field>
                          )}
                        />

                        <button
                          type="button"
                          onClick={() => setGoogleKeyMode("dropzone")}
                          className="w-fit text-xs text-muted-foreground underline-offset-2 hover:underline"
                        >
                          Upload key file instead
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

};
