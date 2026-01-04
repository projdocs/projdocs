import { JSONSchemaType } from "ajv";
import { handle, withAuth } from "@workspace/web/lib/api";
import { User } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@workspace/supabase/admin-client";



export type AdminUsersResponseBodySuccess = {
  user: User
}

export type AdminUsersRequestBody = {
  id: string;
}

const schema: JSONSchemaType<AdminUsersRequestBody> = ({
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: [ "id" ],
});

export const POST: RouteHandler = withAuth(handle<AdminUsersRequestBody>(schema, async ({ id }) => {

  const supabase = createServiceRoleClient();
  const user = await supabase.auth.admin.getUserById(id);
  if (user.error) return Response.json({
    error: user.error.message
  }, { status: 500 });

  return Response.json(user.data satisfies AdminUsersResponseBodySuccess);

}), { mustBeAdmin: true });