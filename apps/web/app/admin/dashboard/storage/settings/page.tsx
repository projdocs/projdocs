import { ObjectPage } from "@apps/web/components/page";
import { createServiceRoleClient } from "@apps/web/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card";
import { Tables } from "@packages/supabase/types.gen";
import { StorageForm } from "./storage-form";
import { isAdmin } from "@apps/web/lib/is-admin";
import { Badge } from "@packages/ui/components/badge";

type GoogleServiceAccountKey = {
  type?: "service_account";
  project_id?: string;
  private_key_id?: string;
  private_key?: string;
  client_email?: string;
  client_id?: string;
  auth_uri?: "https://accounts.google.com/o/oauth2/auth";
  token_uri?: "https://oauth2.googleapis.com/token";
  auth_provider_x509_cert_url?: "https://www.googleapis.com/oauth2/v1/certs";
  client_x509_cert_url?: string;
  universe_domain?: "googleapis.com";
};

const formatData = (settings: Tables<"settings_storage">): string => {
  switch (settings.type) {
    case "BUILT_IN":
    case "S3":
      return "";
    case "GOOGLE_DRIVE":
      const str: GoogleServiceAccountKey = {};
      if (settings.data !== null && typeof settings.data === "object")
        for (const [key, value] of Object.entries(settings.data)) {
          switch (key as keyof GoogleServiceAccountKey) {
            case "type":
            case "auth_uri":
            case "token_uri":
            case "auth_provider_x509_cert_url":
            case "universe_domain":
              // @ts-expect-error Object.entries mismatches types
              str[key] = value;
              break;
            default:
              if (typeof value === "string") {
                // @ts-expect-error Object.entries mismatches types
                str[key] =
                  value.length > 7
                    ? value.slice(0, 2) + "***" + value.slice(-2)
                    : "*".repeat(value.length);
              }
              break;
          }
        }
      return JSON.stringify(str, null, 2);
  }
};

export default async function () {
  const supabase = await createServiceRoleClient();

  let storage = await supabase.from("settings_storage").select().maybeSingle();
  if (!storage.error && storage.data === null) {
    storage = await supabase
      .from("settings_storage")
      .insert({})
      .select()
      .single();
  }

  if (storage.error) console.error(storage.error);

  return (
    <ObjectPage
      title={"Storage"}
      description={"Configure how ProjDocs stores folders and files."}
      action={
        <Badge
          className={"px-8 py-3 font-bold"}
          variant={storage.data?.is_valid ? "default" : "destructive"}
        >
          {storage.data?.is_valid ? "Connected" : "Invalid"}
        </Badge>
      }
    >
      {storage.error ? (
        <div
          className={"flex h-full w-full flex-col items-center justify-center"}
        >
          <Card className={"w-full max-w-sm"}>
            <CardHeader>
              <CardTitle>{"Unable to load storage settings!"}</CardTitle>
              <CardDescription>
                {"An error occurred while loading the storage settings."}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <StorageForm
          onSubmitAction={async (form) => {
            "use server";
            if (!(await isAdmin())) throw new Error("unauthorized!");

            const supabase = await createServiceRoleClient();
            const { error } = await supabase
              .from("settings_storage")
              .update({
                type: form.type,
                data:
                  form.type === "BUILT_IN"
                    ? {}
                    : form.type === "GOOGLE_DRIVE"
                      ? JSON.parse(form.data)
                      : form.type === "S3"
                        ? {
                            bucket: form.s3.bucket,
                            accessKeyId: form.s3.keys.access,
                            secretKey: form.s3.keys.secret,
                            endpoint: form.s3.url,
                            region: form.s3.region,
                          }
                        : {},
              })
              .eq("id", true)
              .select()
              .single();
            if (error) throw new Error(error.message);
          }}
          initialValues={{
            data: formatData(storage.data!),
            is_valid: storage.data!.is_valid,
            type: storage.data!.type,
            s3: {
              url:
                storage.data?.type === "S3" &&
                typeof storage.data.data === "object" &&
                storage.data.data !== null &&
                "endpoint" in storage.data.data &&
                typeof storage.data.data.endpoint === "string"
                  ? (storage.data.data.endpoint as string)
                  : "",
              bucket:
                storage.data?.type === "S3" &&
                typeof storage.data.data === "object" &&
                storage.data.data !== null &&
                "bucket" in storage.data.data &&
                typeof storage.data.data.bucket === "string"
                  ? (storage.data.data.bucket as string)
                  : "",
              region:
                storage.data?.type === "S3" &&
                typeof storage.data.data === "object" &&
                storage.data.data !== null &&
                "region" in storage.data.data &&
                typeof storage.data.data.region === "string"
                  ? (storage.data.data.region as string)
                  : "",
              keys: {
                secret: "", // for security, do not send to client
                  // storage.data?.type === "S3" &&
                  // typeof storage.data.data === "object" &&
                  // storage.data.data !== null &&
                  // "secretKey" in storage.data.data &&
                  // typeof storage.data.data.secretKey === "string"
                  //   ? (storage.data.data.secretKey as string)
                  //   : "",
                access:
                  storage.data?.type === "S3" &&
                  typeof storage.data.data === "object" &&
                  storage.data.data !== null &&
                  "accessKeyId" in storage.data.data &&
                  typeof storage.data.data.accessKeyId === "string"
                    ? storage.data.data.accessKeyId
                    : "",
              },
            },
          }}
        />
      )}
    </ObjectPage>
  );
}
