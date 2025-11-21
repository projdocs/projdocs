"use client";

import { Label } from "@workspace/ui/components/label.tsx";
import { Input } from "@workspace/ui/components/input.tsx";
import { P } from "@workspace/ui/components/text.tsx";
import { HTMLInputTypeAttribute, useState } from "react";
import { Button } from "@workspace/ui/components/button.tsx";
import { LoaderIcon, LucideIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { CONSTANTS } from "@workspace/consts/consts.ts";



type BaseProps = {
  label: string;
  placeholder: string;
  hint: string;
  initialValue: string;
  validator?: keyof typeof CONSTANTS.VALIDATORS | RegExp;
  onClickAction?: (value: string) => Promise<any>;
  onChangeAction?: (value: string) => void;
  type?: HTMLInputTypeAttribute | undefined;
  icon?: LucideIcon | undefined;
}

export const SettingGroup = ({
                               label,
                               hint,
                               placeholder,
                               initialValue,
                               validator,
                               onClickAction,
                               onChangeAction,
                               type,
                               ...props
                             }: BaseProps) => {

  const [ trueValue, setTrueValue ] = useState<string>(initialValue);
  const [ value, setValue ] = useState<string>(initialValue);
  const [ saving, setSaving ] = useState(false);
  const needsSave = trueValue !== value;

  return (
    <div className={"flex flex-col"}>
      <Label className={"mb-1"}>{label}</Label>
      <div className={"flex flex-row gap-2"}>
        <Input
          type={type}
          disabled={saving}
          onChange={(e) => {
            setValue(e.target.value);
            !!onChangeAction && onChangeAction(e.target.value);
          }}
          className={"w-full"}
          value={value}
          placeholder={placeholder}
        />
        {onClickAction !== undefined && (
          <Button
            disabled={!needsSave || saving}
            size={"icon"}
            variant={needsSave ? undefined : "ghost"}
            onClick={async () => {
              setSaving(true);
              try {
                let cont = true;
                if (validator) {
                  const regexp: RegExp = typeof validator === "string" ? CONSTANTS.VALIDATORS[validator] : validator;
                  if (!regexp.test(value)) {
                    toast.error("Invalid Input!", { description: "Input validation failed for this value. Please check your entry and try again." });
                    cont = false;
                  }
                }
                if (cont) {
                  await onClickAction(value);
                  setTrueValue(value);
                }
              } catch (e) {
                console.error(e);
                toast.error("Unexpected Error Occurred!", { description: "An unexpected error occurred while processing your request" });
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving
              ? <LoaderIcon/>
              : props.icon ? <props.icon/> : <SaveIcon/>
            }
          </Button>
        )}
      </div>
      <P className={"text-muted"}>{hint}</P>
    </div>
  );

};