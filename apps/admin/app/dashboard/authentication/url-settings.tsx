"use client";
import { H3, P } from "@workspace/ui/components/text.tsx";
import { SettingGroup } from "./settings-group.tsx";
import { kv } from "@workspace/admin/lib/db/kv.ts";
import { KvKeys } from "@workspace/admin/lib/db/enum.ts";
import { onClick } from "./action.ts";



export const URLSettings = ({initialSiteUrl, initialApiUrl}: {
  initialSiteUrl: string;
  initialApiUrl: string;
}) => (
  <div className={"flex flex-col gap-4"}>

    <div className={"flex flex-col"}>
      <H3>{"URLs"}</H3>
      <P>{"Control how users access ProjDocs"}</P>
    </div>

    <SettingGroup
      label={"Site URL"}
      placeholder={"projdocs.example.com"}
      hint={"The URL where users can access the ProjDocs dashboard"}
      initialValue={initialSiteUrl}
      validator={"SITE_URL"}
      onClickAction={async (value) => await onClick({ setting: KvKeys.SITE_URL, value })}
    />

    <SettingGroup
      initialValue={initialApiUrl}
      label={"API URL"}
      placeholder={"api.projdocs.example.com"}
      hint={"The URL where users can access the ProjDocs (Kong) API"}
      validator={"SITE_URL"}
      onClickAction={async (value) => await onClick({ setting: KvKeys.API_URL, value })}
    />

  </div>
);