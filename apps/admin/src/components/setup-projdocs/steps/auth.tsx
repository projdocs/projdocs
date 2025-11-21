"use client";
import { Step, StepComponentProps } from "@workspace/admin/components/setup-projdocs/types.ts";
import { Eye, EyeOff, KeyRoundIcon, RefreshCcw, Shuffle } from "lucide-react";
import { useState } from "react";
import { Label } from "@workspace/ui/components/label.tsx";
import { Input } from "@workspace/ui/components/input.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip.tsx";
import { Button } from "@workspace/ui/components/button.tsx";
import { random } from "@workspace/admin/lib/random.ts";
import { H3, P } from "@workspace/ui/components/text.tsx";
import { SettingGroup } from "../../../../app/dashboard/authentication/settings-group.tsx";
import { Switch } from "@workspace/ui/components/switch.tsx";
import { testCloudflareToken } from "@workspace/admin/components/setup-projdocs/steps/actions.ts";
import { toast } from "sonner";



const JwtSecretInput = (props: StepComponentProps) => {

  const [ visible, setVisible ] = useState<boolean>(false);

  return (
    <div className="space-y-2 w-full">
      <Label>{"JWT Secret"}</Label>
      <div className={"flex flex-row w-full gap-4"}>
        <Input
          disabled
          className={"flex-1 min-w-0 max-w-none"}
          type={visible ? "text" : "password"}
          value={props.store.state.auth.jwtSecret}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setVisible(visible => !visible)} variant={"outline"} size={"icon"}>
              {visible
                ? <EyeOff/>
                : <Eye/>
              }
            </Button>
          </TooltipTrigger>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"outline"}
              size={"icon"}
              onClick={() => props.store.set("auth", "jwtSecret", random.string(32))}
            >
              <Shuffle/>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <P>{"Generate Random Secret"}</P>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export const setupAuth: Step = {
    title: "Authentication",
    icon: KeyRoundIcon,
    component: (props) => (
      <div className={"flex flex-col space-y-6 w-full"}>

        <JwtSecretInput {...props} />

        <div className={"flex flex-col gap-4"}>

          <div className={"flex flex-col"}>
            <H3>{"URLs"}</H3>
            <P>{"Control how users access ProjDocs"}</P>
          </div>

          <SettingGroup
            label={"Site URL"}
            placeholder={"projdocs.example.com"}
            hint={"The URL where users can access the ProjDocs dashboard"}
            initialValue={props.store.state.auth.siteUrl}
            onChangeAction={(value) => props.store.set("auth", "siteUrl", value)}
          />

          <SettingGroup
            initialValue={props.store.state.auth.apiUrl}
            label={"API URL"}
            placeholder={"api.projdocs.example.com"}
            hint={"The URL where users can access the ProjDocs (Kong) API"}
            onChangeAction={(value) => props.store.set("auth", "apiUrl", value)}
          />

        </div>

        <div className={"flex flex-col gap-4"}>

          <div className={"flex flex-col"}>
            <H3>{"HTTPS"}</H3>
            <P>{"Configure secure connection to ProjDocs"}</P>
          </div>

          <div className={"flex flex-row gap-2"}>
            <Switch checked={props.store.state.auth.useCloudflare}
                    onCheckedChange={(checked) => props.store.set("auth", "useCloudflare", checked)}/>
            <Label>{"Use Cloudflare & Certbot to auto-provision HTTPS certificates"}</Label>
          </div>

          {props.store.state.auth.useCloudflare && (
            <SettingGroup
              icon={RefreshCcw}
              type={"password"}
              initialValue={props.store.state.auth.cloudflareApiToken}
              label={"Cloudflare API Token"}
              placeholder={"Enter Token Here"}
              hint={"Permission(s) Required: `Zone:DNS:Edit` for the zone(s) covering the above domain(s)"}
              onChangeAction={(value) => props.store.set("auth", "cloudflareApiToken", value)}
              onClickAction={async (value) => {
                const result = await testCloudflareToken({ value });
                if (!result.succeeded) toast.error("Token-Check Failed", { description: "The token you entered could not be validated with Cloudflare" });
                else if (!result.active) toast.error("Token Not Active", { description: "The token you entered is not active with Cloudflare" });
                else if (!result.valid) console.warn("cloudflare token was not validated");
              }}
            />
          )}

        </div>

      </div>
    ),
  }
;