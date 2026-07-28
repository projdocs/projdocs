import Body from "./page-body";
import { getAuthProviders, getOrganizations, getStorageProviders } from "@apps/web/app/setup/actions";
import { createServerClient } from "@apps/web/lib/supabase/server";
import { connection } from "next/server";



export default async function() {

  await connection();

  return (
    <Body
      getProvidersPromise={getAuthProviders(process.env.PROJDOCS_API_URL)}
      getStorageProvidersPromise={getStorageProviders(await createServerClient())}
      getOrganizationsPromise={getOrganizations(await createServerClient())}
    />
  );
}