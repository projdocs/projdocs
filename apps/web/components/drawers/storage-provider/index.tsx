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
  FieldDescription,
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
import { ReactElement, ReactNode, useRef } from "react";
import {
  GoogleDriveConfigSchema,
  StorageProviderTypes,
} from "@apps/web/lib/storage/type";
import { Card } from "@packages/ui/components/card";
import { onSubmit } from "@apps/web/components/drawers/storage-provider/actions";
import {
  Form,
  formSchema,
} from "@apps/web/components/drawers/storage-provider/types";

const GoogleDriveStorageProviderForm = ({
  form,
}: {
  form: Form<"GOOGLE_DRIVE">;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const { field: keyFile } = useController({
    name: "googleDrive.jsonKey",
    control: form.control,
  });

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Shared Drive ID</FieldLabel>
        <Input
          disabled={form.formState.isSubmitting}
          placeholder={"0AJb1l5urdas7Uk9PVA"}
          {...form.register("googleDrive.parentID")}
        />
        {form.formState.errors.googleDrive?.parentID ? (
          <FieldError>
            {form.formState.errors.googleDrive?.parentID.message}
          </FieldError>
        ) : (
          <FieldDescription>
            {"https://drive.google.com/drive/folders/{id}"}
          </FieldDescription>
        )}
      </Field>

      <Field>
        <FieldLabel>Service Account Key</FieldLabel>

        <div className={"flex flex-row items-center justify-between gap-2"}>
          <Card className={"w-full p-2 px-4"}>
            <input
              style={{ display: "none" }}
              ref={fileRef}
              type={"file"}
              accept={"application/json"}
              onChange={async (e) => {
                const file = e.target.files?.item(0);

                if (!file) return;

                try {
                  const text = await file.text();

                  const parsed = JSON.parse(text);

                  const result =
                    GoogleDriveConfigSchema.shape.jsonKey.safeParse(parsed);

                  if (!result.success) {
                    form.setError("googleDrive.jsonKey", {
                      type: "manual",

                      message: "Invalid service account JSON format",
                    });

                    return;
                  }

                  keyFile.onChange(result.data);

                  form.clearErrors("googleDrive.jsonKey");
                } catch (err) {
                  form.setError("googleDrive.jsonKey", {
                    type: "manual",

                    message: "Invalid JSON file",
                  });
                }

                keyFile.onBlur();
              }}
            />
            <div className={"truncate"}>
              {fileRef.current?.files?.item(0)?.name ?? "Select a file"}
            </div>
          </Card>

          <Button
            type={"button"}
            variant={"outline"}
            onClick={() => fileRef.current?.click()}
          >
            {fileRef.current?.files?.item(0)?.name ? "Replace" : "Upload"}
          </Button>
        </div>

        {form.formState.errors.googleDrive?.jsonKey && (
          <FieldError>
            {form.formState.errors.googleDrive?.jsonKey.message}
          </FieldError>
        )}
      </Field>
    </FieldGroup>
  );
};

const S3StorageProviderForm = ({
  form: { register, formState },
}: {
  form: Form<"S3">;
}) => (
  <FieldGroup>
    <Field>
      <FieldLabel>Endpoint URL</FieldLabel>
      <Input
        disabled={formState.isSubmitting}
        placeholder="https://s3.amazonaws.com"
        {...register("s3.endpoint")}
      />
      {formState.errors.s3?.endpoint && (
        <FieldError>{formState.errors.s3?.endpoint.message}</FieldError>
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
        <FieldError>{formState.errors.s3?.region.message}</FieldError>
      )}
    </Field>
    <Field>
      <FieldLabel>Bucket</FieldLabel>
      <Input disabled={formState.isSubmitting} {...register("s3.bucket")} />
      {formState.errors.s3?.bucket && (
        <FieldError>{formState.errors.s3?.bucket.message}</FieldError>
      )}
    </Field>
    <Field>
      <FieldLabel>Access Key ID</FieldLabel>
      <Input
        disabled={formState.isSubmitting}
        {...register("s3.accessKeyId")}
      />
      {formState.errors.s3?.accessKeyId && (
        <FieldError>{formState.errors.s3?.accessKeyId.message}</FieldError>
      )}
    </Field>
    <Field>
      <FieldLabel>Secret Access Key</FieldLabel>
      <Input
        type="password"
        disabled={formState.isSubmitting}
        {...register("s3.secretKey")}
      />
      {formState.errors.s3?.secretKey && (
        <FieldError>{formState.errors.s3?.secretKey.message}</FieldError>
      )}
    </Field>
  </FieldGroup>
);

const StorageProviderForm = ({
  form,
}: {
  form: Form<Enums<"settings_storage_type">>;
}): ReactElement => {
  const { field: typeField } = useController({
    name: "type",
    control: form.control,
  });

  switch (typeField.value) {
    case "GOOGLE_DRIVE":
      return (
        <GoogleDriveStorageProviderForm form={form as Form<"GOOGLE_DRIVE">} />
      );
    case "S3":
      return <S3StorageProviderForm form={form as Form<"S3">} />;
    case null:
    case "BUILT_IN":
      return <></>;
  }
};

export const StorageProviderDrawer = (props: { trigger?: ReactNode }) => {
  const form = useForm<Form<Enums<"settings_storage_type">>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: null as unknown as Enums<"settings_storage_type">,
      s3: {
        bucket: "",
        region: "",
        endpoint: "",
        secretKey: "",
        accessKeyId: "",
      },
      googleDrive: {
        parentID: "",
        jsonKey: {
          private_key: "",
          auth_provider_x509_cert_url:
            "https://www.googleapis.com/oauth2/v1/certs",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          client_email: "",
          client_id: "",
          client_x509_cert_url: "",
          project_id: "",
          token_uri: "https://oauth2.googleapis.com/token",
          type: "service_account",
          universe_domain: "googleapis.com",
        },
      },
    },
  });

  const { field: typeField } = useController({
    name: "type",
    control: form.control,
  });

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
      <DrawerContent className={"flex h-full max-h-screen flex-col"}>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={async (f) =>
            toast.promise(form.handleSubmit(onSubmit)(f), {
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
            })
          }
        >
          <DrawerHeader>
            <DrawerTitle>{"Setup Storage Provider"}</DrawerTitle>
            <DrawerDescription>
              {
                "Enter the type and connection details to add a storage provider."
              }
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-scroll px-4 pb-4">
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Select
                    disabled={form.formState.isSubmitting}
                    value={typeField.value ?? ""}
                    onValueChange={typeField.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a storage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{"Storage Providers"}</SelectLabel>
                        {Object.entries(StorageProviderTypes)
                          .filter(([key]) => key !== "BUILT_IN")
                          .map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.type && (
                    <FieldError>
                      {form.formState.errors.type.message}
                    </FieldError>
                  )}
                </Field>
              </FieldGroup>

              <StorageProviderForm form={form} />
            </FieldSet>
          </div>

          <DrawerFooter className={"shrink-0 border-t"}>
            <Button
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              type={"submit"}
            >
              Submit
            </Button>

            <DrawerClose asChild>
              <Button disabled={form.formState.isSubmitting} variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
