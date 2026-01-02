import { JSONSchemaType } from "ajv";
import { handle, withAuth } from "@workspace/web/lib/api";
import { GoTrueAdminApi } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@workspace/supabase/admin-client";



export type AdminUsersResponseBodySuccess = Extract<Awaited<ReturnType<GoTrueAdminApi["listUsers"]>>["data"], {
  aud: string
}>

export type AdminUsersRequestBody = {
  page: number;
  perPage: number;
}

const schema: JSONSchemaType<AdminUsersRequestBody> = ({
  type: "object",
  properties: {
    page: { type: "number" },
    perPage: { type: "number" }
  },
  required: [ "page", "perPage" ],
});

export const POST: RouteHandler = withAuth(handle<AdminUsersRequestBody>(schema, async ({ page, perPage }) => {

  if (typeof page !== "number" || typeof perPage !== "number" || page < 1 || perPage < 1) return Response.json({
    error: "bad request"
  }, { status: 400 });

  const supabase = createServiceRoleClient();
  const users = await supabase.auth.admin.listUsers({ page, perPage });
  if (users.error) return Response.json({
    error: users.error.message
  }, { status: 500 });

  return Response.json(users.data);

}), { mustBeAdmin: true });