"use server";

import { SetupProjDocsState, SetupProjDocsStore } from "@workspace/admin/components/setup-projdocs/store.ts";
import { Client } from "pg";
import { SignJWT } from "jose";
import { kv } from "@workspace/admin/lib/db/kv.ts";
import { random } from "@workspace/admin/lib/random.ts";
import { KvKeys } from "@workspace/admin/lib/db/enum.ts";



export const onComplete = async (store: SetupProjDocsStore): Promise<void> => {

  const AnonKey = {
    "role": "anon",
    "iss": "supabase",
    "iat": 1735689600, // 2025.01.01 @ 00:00 GMT
    "exp": 2051222400, // 2035.01.01 @ 00:00 GMT
  };

  const ServiceKey = {
    "role": "service_role",
    "iss": "supabase",
    "iat": 1735689600, // 2025.01.01 @ 00:00 GMT
    "exp": 2051222400, // 2035.01.01 @ 00:00 GMT
  };

  const sign = async (object: {}, secret: string) =>
    await new SignJWT(object)
      .setProtectedHeader({ alg: "HS256" })
      .sign(new TextEncoder().encode(secret));

  const publicKey = await sign(AnonKey, store.state.auth.jwtSecret);
  const privateKey = await sign(ServiceKey, store.state.auth.jwtSecret);

  const useSelfHosted = store.state.database.mode === "self-hosted";

  kv.set(KvKeys.DB_INIT, "1")
    .set(KvKeys.PGSODIUM_ENCRYPTION_KEY, random.string(32))
    .set(KvKeys.REALTIME_BASE_KEY, random.string(32))
    .set(KvKeys.JWT_SECRET, store.state.auth.jwtSecret)
    .set(KvKeys.PRIVATE_JWT, privateKey)
    .set(KvKeys.PUBLIC_JWT, publicKey)
    .set(KvKeys.POSTGRES_USE_SELF_HOSTED, useSelfHosted ? "1" : null)
    .set(KvKeys.POSTGRES_HOST, useSelfHosted ? "db" : store.state.database.host)
    .set(KvKeys.POSTGRES_PORT, useSelfHosted ? "5432" : store.state.database.port)
    .set(KvKeys.POSTGRES_DB, useSelfHosted ? "postgres" : store.state.database.database)
    .set(KvKeys.POSTGRES_USER, useSelfHosted ? "postgres" : store.state.database.username)
    .set(KvKeys.POSTGRES_PASSWORD, store.state.database.password)
    .set(KvKeys.CLOUDFLARE_AUTOPROVISION_HTTPS, store.state.auth.useCloudflare ? "1" : null)
    .set(KvKeys.CLOUDFLARE_API_TOKEN, store.state.auth.useCloudflare ? store.state.auth.cloudflareApiToken : null);
};