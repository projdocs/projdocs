import { createClient } from "@workspace/web/lib/supabase/server";



export const withAuth = (after: RouteHandler, options?: {
  mustBeAdmin?: boolean;
}): RouteHandler => async (request) => {

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error !== null) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return Response.json({
      error: "unable to authenticate"
    }, { status: 401 });
  }

  if (data.user === null) return Response.json({
    error: "unauthenticated"
  }, { status: 401 });

  if (options?.mustBeAdmin === true) {
    const admin = await supabase.from("admins").select().eq("id", data.user.id).maybeSingle();
    if(admin.error) return Response.json({
      error: "internal server error"
    }, { status: 500 });
    if(admin.data === null) return Response.json({
      error: "unauthenticated"
    }, { status: 401 });
  }

  return await after(request);

};