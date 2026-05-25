import Body from "./page-body";
import { ErrorPage } from "@packages/ui/components/page";
import { getProviders } from "@apps/web/app/setup/actions";


export default async function() {

  const apiBase = process.env.PROJDOCS_API_URL;
  if (!apiBase) {
    return <ErrorPage title={"Configuration Error"} description={"`PROJDOCS_API_URL` is not set"} />;
  }

  const kongURL = process.env.SUPABASE_KONG_URL?.trim();
  if (!kongURL) {
    return <ErrorPage title={"Configuration Error"} description={"`SUPABASE_KONG_URL` is not set"} />;
  }

  return (
    <Body
      kongURL={kongURL}
      apiURL={apiBase}
      getProvidersPromise={getProviders(apiBase)}
    />
  )
}