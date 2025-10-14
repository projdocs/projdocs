import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { Button } from "@workspace/ui/components/button";
import { OctagonX } from "lucide-react";
import { AuthStatus, useAuthStore } from "@workspace/desktop/src/lib/auth/store";
import { P } from "@workspace/ui/components/text";



export const Toolbar = () => {

  const [ hovered, setHovered ] = useState(false);
  const auth = useAuthStore();

  return (
    <div className={"flex flex-row justify-between items-center align-middle w-full p-2"}>
      { auth.state.state === AuthStatus.LOGGED_IN && (
        <div className={"align-middle justify-center"}>
          <P className={"text-muted text-xs pl-2"}>{auth.state.settings.url}</P>
        </div>
      ) }
      <div className={"ml-auto"}>
        <Tooltip onOpenChange={setHovered}>
          <TooltipTrigger asChild>
            <Button
              variant={"ghost"}
              size={"sm"}
              onClick={window.app.quit}
            >
              <OctagonX className={hovered ? "text-primary" : "text-secondary"} size={5}/>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{"Quit ProjDocs"}</p>
          </TooltipContent>
        </Tooltip>
      </div>

    </div>
  );
};