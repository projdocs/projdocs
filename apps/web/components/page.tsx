import { H2 } from "@packages/ui/components/typography";
import { ReactNode } from "react";

export const ObjectPage = (props: {
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}) => (
  <div className={"flex w-full h-full flex-col gap-8 p-8"}>
    <div className={"flex flex-row items-center justify-between"}>
      <div className={"flex flex-col"}>
        <H2>{props.title}</H2>
        {props.description && (
          <p className={"text-muted-foreground"}>{props.description}</p>
        )}
      </div>
      {props.action && props.action}
    </div>

    {props.children}
  </div>
);
