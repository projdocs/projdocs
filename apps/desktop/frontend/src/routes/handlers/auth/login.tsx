import { useState } from "react";
import Logo from "@packages/ui/branding/logo/logo";
import { ButtonGroup } from "@packages/ui/components/button-group";
import { Button } from "@packages/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@packages/ui/components/input-group";
import { toast } from "sonner";
import { Browser, Events } from "@wailsio/runtime";
import { StarfieldBackground } from "@packages/ui/backgrounds/stars";



const validIpAddress = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:([0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/;

const validHostname = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;

function normalizeUrl(input: string): string | null {
  if (validIpAddress.test(input) || validHostname.test(input)) {
    return `${import.meta.env.DEV ? "http" : "https"}://${input}`;
  }
  return null; // neither a valid IP nor hostname
}

export default function LoginPage() {

  const [ input, setInput ] = useState(import.meta.env.DEV ? "127.0.0.1:3000" : "");

  return (
    <StarfieldBackground>

      <div className="flex h-dvh w-dvw flex-col items-center">
        <div className="flex-1 h-1/3" />
        <Logo className="w-1/3" />
        <div className="flex flex-1 flex-col items-center pt-8 gap-1">
          <ButtonGroup>
            <InputGroup>
              <InputGroupInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="dms.projdocs.com"
                disabled={import.meta.env.DEV}
              />
              <InputGroupAddon>
                {"https://"}
              </InputGroupAddon>
            </InputGroup>
            <Button
              variant="outline"
              onClick={async () => {
                const fqdn = normalizeUrl(input);
                if (fqdn === null) {
                  toast.error("Invalid URL!");
                  return;
                }

                const url = new URL(fqdn);
                url.pathname = "/auth/authorize";
                url.searchParams.set("aud", "desktop");

                try {
                  await Browser.OpenURL(url);
                  await Events.Emit("projdocs:window:set-visible", false);
                } catch {
                  toast.error("Unable to Open Browser!", {
                    description: `Enter the following URL in a browser window to continue: ${url.toString()}`,
                  });
                }
              }}
            >{"Login"}</Button>
          </ButtonGroup>
          <p className={"text-muted-foreground text-xs"}>{"Enter a server hostname to continue."}</p>
        </div>
      </div>

    </StarfieldBackground>
  );

}

