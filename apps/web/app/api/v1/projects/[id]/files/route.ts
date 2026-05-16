import { createServerClient, createServiceRoleClient } from "@apps/web/lib/supabase/server";
import { StorageError, StorageResponse } from "@packages/shared/utilities/storage/type";
import { Tables } from "@packages/supabase";
import { StorageProvider } from "@packages/shared/utilities/storage";
import { v4 } from "uuid";



type Ctx = RouteContext<"/api/v1/projects/[id]/files">;
type RouteHandler = (request: Request, ctx: Ctx) => Promise<Response>;

const upload = async (request: Request, ctx: Ctx, file?: Tables<"files">): Promise<Response> => {

  const url = new URL(request.url);
  const mimeType = url.searchParams.get("mime-type");
  if (!mimeType) return StorageResponse.Error(new StorageError("`mime-type` query parameter is required")).toResponse(400);

  const params = await ctx.params;
  if (file !== undefined && file.project_id !== params.id) return StorageResponse
    .Error(new StorageError(`file(id="${file.id}") does not belong to project(id="${params.id}")`))
    .toResponse(400);

  // load the project
  const supabase = await createServerClient();
  const project = await supabase.from("projects").select().eq("id", params.id).maybeSingle();
  if (project.error) return StorageResponse
    .Error(new StorageError(`unable to load project(id="${params.id}")`))
    .toResponse(500);
  if (project.data === null) return StorageResponse
    .Error(new StorageError(`project(id="${params.id}") does not exist or is inaccessible`))
    .toResponse(404);

  // manually check permissions
  const member = await supabase.from("members").select("*, permissions:permissions_id!inner(*, organization:organization_id(*))").eq("permissions_id.organization_id", project.data.organization_id).single();
  if (member.error) return StorageResponse.Error(new StorageError("unable to check permissions")).toResponse(500);
  if (member.data.permissions.projects !== "EDIT" && member.data.permissions.projects !== "DELETE") return StorageResponse.Error(new StorageError("insufficient privileges to create files")).toResponse(403);

  // load the provider
  const supabaseAdmin = await createServiceRoleClient({ __unsafe_ignore_admin_check: true });
  const providerBase = await supabaseAdmin.from("storage_providers").select().eq("id", member.data.permissions.organization.storage_providers_id).single();
  if (providerBase.error) return StorageResponse.Error(new StorageError("unable to load storage provider")).toResponse();
  const { provider, error: providerError } = StorageProvider.from(providerBase.data);
  if (!provider) return StorageResponse.Error(new StorageError("unable to load storage provider", {
    description: providerError,
  })).toResponse();

  // upload the file
  const uploadID = v4();
  const resp = await provider.upload({
    name: uploadID,
    mimeType: mimeType,
    body: Buffer.from(await request.arrayBuffer()),
  });
  if (resp.error || resp.data === null) return StorageResponse.Error(new StorageError("unable to upload file")).toResponse(500);

  // create the upload
  const upload = await supabaseAdmin.from("storage_uploads").insert({
    id: uploadID,
    provider_id: resp.data,
    storage_provider_id: providerBase.data.id,
  }).select().single();
  if (upload.error) return StorageResponse.Error(new StorageError("file uploaded to storage provider, but an error occurred while creating storage_uploads row")).toResponse();

  // create the file
  if (file === undefined) {
    const newFile = await supabaseAdmin.from("files").insert({
      project_id: project.data.id,
    }).select().single();
    if (newFile.error) return StorageResponse.Error(new StorageError("file uploaded to storage provider, but an error occurred while creating file row")).toResponse();
    file = newFile.data;
  }

  // create the version
  const version = await supabaseAdmin.from("files_versions").insert({
    storage_uploads_id: uploadID,
    files_id: file.id,
  }).select().single();
  if (version.error) return StorageResponse.Error(new StorageError("file uploaded to storage provider, but an error occurred while creating file_version row")).toResponse();

  return StorageResponse.Data(version.data.id).toResponse(200);
};

export const POST: RouteHandler = upload;

export const PUT: RouteHandler = async (request, ctx) => {

  const url = new URL(request.url);
  const fileID = url.searchParams.get("id");
  if (fileID === null) return StorageResponse.Error(new StorageError(`id="${url.searchParams.get("id")}" is null`, {
    description: "hint: to create a new file, use `POST` instead of `PUT`",
  })).toResponse(400);

  // load the file
  const supabase = await createServerClient();
  const file = await supabase.from("files").select().eq("id", fileID).maybeSingle();
  if (file.error) return StorageResponse
    .Error(new StorageError(`unable to load file(id="${fileID}")`))
    .toResponse(500);
  if (file.data === null) return StorageResponse
    .Error(new StorageError(`file(id="${fileID}") does not exist or is inaccessible`))
    .toResponse(404);

  return await upload(request, ctx, file.data);
};