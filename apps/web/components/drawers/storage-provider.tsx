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
import { PlusIcon } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@packages/ui/components/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/select";
import { Input } from "@packages/ui/components/input";
import { useController, useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Enums } from "@packages/supabase/types.gen";
import { z } from "zod";
import { Textarea } from "@packages/ui/components/textarea";
import { createStorageProvider } from "@apps/web/components/drawers/storage-provider-actions";
import { ReactNode } from "react";

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
  s3: z
    .object({
      url: z.string(),
      region: z.string(),
      bucket: z.string(),
      keys: z.object({
        access: z.string(),
        secret: z.string(),
      }),
    })
    .optional(),
});

type StorageFormValues = z.infer<typeof formSchema>;

async function onSubmit(values: StorageFormValues) {
  toast.promise(createStorageProvider(values), {
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

export const StorageProviderDrawer = (props: { trigger?: ReactNode }) => {
  const { register, control, handleSubmit, formState } =
    useForm<StorageFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        data: "",
        type: "",
        s3: {
          bucket: "",
          region: "",
          url: "",
          keys: {
            secret: "",
            access: "",
          },
        },
      },
    });

  const { field: typeField } = useController({ name: "type", control });

  return (
    <Drawer direction={"right"}>
      <DrawerTrigger asChild>
        {props.trigger ?? (
          <Button>
            <PlusIcon />
            {"Create Provider"}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DrawerHeader>
            <DrawerTitle>{"Setup Storage Provider"}</DrawerTitle>
            <DrawerDescription>
              {
                "Enter the type and connection details to add a storage provider."
              }
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
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

                {typeField.value ===
                  ("S3" satisfies Enums<"settings_storage_type">) && (
                  <>
                    <Field>
                      <FieldLabel>Endpoint URL</FieldLabel>
                      <Input
                        disabled={formState.isSubmitting}
                        placeholder="https://s3.amazonaws.com"
                        {...register("s3.url")}
                      />
                      {formState.errors.s3?.url && (
                        <FieldError>
                          {formState.errors.s3.url.message}
                        </FieldError>
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
                        <FieldError>
                          {formState.errors.s3.region.message}
                        </FieldError>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel>Bucket</FieldLabel>
                      <Input
                        disabled={formState.isSubmitting}
                        {...register("s3.bucket")}
                      />
                      {formState.errors.s3?.bucket && (
                        <FieldError>
                          {formState.errors.s3.bucket.message}
                        </FieldError>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel>Access Key ID</FieldLabel>
                      <Input
                        disabled={formState.isSubmitting}
                        {...register("s3.keys.access")}
                      />
                      {formState.errors.s3?.keys?.access && (
                        <FieldError>
                          {formState.errors.s3.keys.access.message}
                        </FieldError>
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
                        <FieldError>
                          {formState.errors.s3.keys.secret.message}
                        </FieldError>
                      )}
                    </Field>
                  </>
                )}

                {typeField.value ===
                  ("GOOGLE_DRIVE" satisfies Enums<"settings_storage_type">) && (
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
          </div>
          <DrawerFooter>
            <Button type={"submit"}>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
