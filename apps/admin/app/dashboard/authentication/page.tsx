import { H1, P } from "@workspace/ui/components/text.tsx";
import { URLSettings } from "./url-settings.tsx";
import { kv } from "@workspace/admin/lib/db/kv.ts";
import { KvKeys } from "@workspace/admin/lib/db/enum.ts";



export default function AuthenticationPage() {

  return (
    <div className={"flex flex-col gap-8 p-8"}>

      <div className={"flex flex-col"}>
        <H1>{"Authentication Settings"}</H1>
        <P>{"Configure how users connect to ProjDocs"}</P>
      </div>

      <URLSettings
        initialSiteUrl={kv.get(KvKeys.SITE_URL) ?? ""}
        initialApiUrl={kv.get(KvKeys.API_URL) ?? ""}
      />

    </div>
  );

}