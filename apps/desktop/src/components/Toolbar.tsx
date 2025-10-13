import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { Button } from "@workspace/ui/components/button";
import { OctagonX } from "lucide-react";



export const Toolbar = () => {

  const [ hovered, setHovered ] = useState(false);

  return (
    <div className={"flex justify-end"}>
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
  );
};