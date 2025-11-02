import { JSONSchemaType } from "ajv";
import { handle, withAuth } from "@workspace/web/lib/api";
import * as process from "node:process";
import { createClient } from "@workspace/web/lib/supabase/server";
import jwt, { JwtPayload } from "jsonwebtoken";


type RequestBody = null

const schema: JSONSchemaType<RequestBody> = ({
  type: "null",
  nullable: true
});

export const GET: RouteHandler = withAuth(handle<RequestBody>(schema, async (data) => {

  if (!process.env.SUPABASE_JWT_SECRET) return Response.json({
    error: "SUPABASE_JWT_SECRET not set"
  }, { status: 400 });

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession(); // behind withAuth, so no need for second API call
  if (!session) return Response.json({
    error: "INVALID SESSION",
  }, { status: 400 });

  const token: JwtPayload = jwt.decode(session.access_token) as JwtPayload;
  token.iat = Math.floor(Date.now() / 1000);
  token.exp = token.iat + 157_680_000; // ~5 years

  return Response.json(jwt.sign(token, process.env.SUPABASE_JWT_SECRET, { algorithm: "HS256" }));
}));