"use client";
import { Step, StepComponentProps } from "@workspace/admin/components/setup-projdocs/types.ts";
import { Eye, EyeOff, KeyRoundIcon, Shuffle } from "lucide-react";
import { useState } from "react";
import { Label } from "@workspace/ui/components/label.tsx";
import { Input } from "@workspace/ui/components/input.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip.tsx";
import { Button } from "@workspace/ui/components/button.tsx";
import { random } from "@workspace/admin/lib/random.ts";
import { P } from "@workspace/ui/components/text.tsx";



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
    </div>
  ),
};