import { JSONSchemaType } from "ajv";
import { handle, withAuth } from "@workspace/web/lib/api";
import { User } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@workspace/supabase/admin-client";
import { createClient } from "@workspace/web/lib/supabase/server";



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

export const DELETE: RouteHandler = withAuth(handle<AdminUsersRequestBody>(schema, async ({ id }) => {

  const sb = await createClient()
  const user = await sb.auth.getSession()
  if (user.data.session?.user.id === id) return Response.json({
    error: "cannot delete own user"
  }, { status: 400 })

  const supabase = createServiceRoleClient();
  const { error } = await supabase.auth.admin.deleteUser(id, false);
  if (error) return Response.json({
    error: error.message,
  }, { status: 500 });

  return Response.json({ id });

}), { mustBeAdmin: true });


export const POST: RouteHandler = withAuth(handle<AdminUsersRequestBody>(schema, async ({ id }) => {

  const supabase = createServiceRoleClient();
  const user = await supabase.auth.admin.getUserById(id);
  if (user.error) return Response.json({
    error: user.error.message
  }, { status: 500 });

  return Response.json(user.data satisfies AdminUsersResponseBodySuccess);

}), { mustBeAdmin: true });