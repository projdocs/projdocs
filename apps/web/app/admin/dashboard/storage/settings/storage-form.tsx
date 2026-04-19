"use client";

import { useController, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/select";
import { Button } from "@packages/ui/components/button";
import { Input } from "@packages/ui/components/input";
import { Textarea } from "@packages/ui/components/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@packages/ui/components/field";
import { Enums, Tables } from "@packages/supabase/types.gen";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card";
import { toast } from "sonner";
import { S3StorageConnectionSettings } from "@apps/web/lib/storage/impl-s3";

const types = {
  BUILT_IN: "Built-In (Supabase Storage)",
  GOOGLE_DRIVE: "Google Drive API",
  S3: "S3-Compatible Storage API",
} satisfies {
  [key in Enums<"settings_storage_type">]: string;
};

const formSchema = z.object({
  type: z.enum(Object.keys(types)),
  data: z.string(),
  s3: z.object({
    url: z.string(),
    region: z.string(),
    bucket: z.string(),
    keys: z.object({
      access: z.string(),
      secret: z.string(),
    }),
  }).optional(),
});

type StorageFormValues = z.infer<typeof formSchema>;

type Form = Pick<Tables<"settings_storage">, "type" | "is_valid"> & {
  data: string;
  s3: S3StorageConnectionSettings;
};

export function StorageForm({
  initialValues,
  onSubmitAction,
}: {
  initialValues: Form;
  onSubmitAction: (form: Form) => Promise<unknown>;
}) {
  const { register, control, handleSubmit, formState } =
    useForm<StorageFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        ...initialValues,
      },
    });

  const { field: typeField } = useController({ name: "type", control });

  async function onSubmit(values: StorageFormValues) {
    toast.promise(onSubmitAction(values as Form), {
      success: () => {
        setTimeout(() => window.location.reload(), 1500);
        return {
          message: "Settings Saved!",
          description: "The page will now reload...",
        };
      },
      error: {
        message: "Unable to Save Settings!",
        description:
          "An unexpected error occurred while saving the storage-adapter settings.",
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardAction>
            <Button
              type="submit"
              disabled={!formState.isDirty || formState.isSubmitting}
            >
              Save Changes
            </Button>
          </CardAction>
          <CardTitle>{"Configure Storage Adapter"}</CardTitle>
          <CardDescription>
            {
              "Choose the storage provider ProjDocs will connect to for files and folders."
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Select
                  disabled={formState.isSubmitting}
                  value={typeField.value}
                  onValueChange={typeField.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a storage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{"Storage Providers"}</SelectLabel>
                      {Object.entries(types).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formState.errors.type && (
                  <FieldError>{formState.errors.type.message}</FieldError>
                )}
              </Field>

              {typeField.value === ("S3" satisfies Enums<"settings_storage_type">) && (
                <>
                  <Field>
                    <FieldLabel>Endpoint URL</FieldLabel>
                    <Input
                      disabled={formState.isSubmitting}
                      placeholder="https://s3.amazonaws.com"
                      {...register("s3.url")}
                    />
                    {formState.errors.s3?.url && (
                      <FieldError>{formState.errors.s3.url.message}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Region</FieldLabel>
                    <Input
                      disabled={formState.isSubmitting}
                      placeholder="us-east-1"
                      {...register("s3.region")}
                    />
                    {formState.errors.s3?.region && (
                      <FieldError>{formState.errors.s3.region.message}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Bucket</FieldLabel>
                    <Input
                      disabled={formState.isSubmitting}
                      {...register("s3.bucket")}
                    />
                    {formState.errors.s3?.bucket && (
                      <FieldError>{formState.errors.s3.bucket.message}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Access Key ID</FieldLabel>
                    <Input
                      disabled={formState.isSubmitting}
                      {...register("s3.keys.access")}
                    />
                    {formState.errors.s3?.keys?.access && (
                      <FieldError>{formState.errors.s3.keys.access.message}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Secret Access Key</FieldLabel>
                    <Input
                      type="password"
                      disabled={formState.isSubmitting}
                      {...register("s3.keys.secret")}
                    />
                    {formState.errors.s3?.keys?.secret && (
                      <FieldError>{formState.errors.s3.keys.secret.message}</FieldError>
                    )}
                  </Field>
                </>
              )}

              {typeField.value === ("GOOGLE_DRIVE" satisfies Enums<"settings_storage_type">) && (
                <Field>
                  <FieldLabel>Service Account Key</FieldLabel>
                  <Textarea
                    disabled={formState.isSubmitting}
                    rows={10}
                    className="font-mono"
                    {...register("data")}
                  />
                  {formState.errors.data && (
                    <FieldError>{formState.errors.data.message}</FieldError>
                  )}
                </Field>
              )}
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </Card>
    </form>
  );
}
