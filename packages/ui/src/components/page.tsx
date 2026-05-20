import { H1 } from "@packages/ui/components/typography";
import type { ReactNode } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";



export const ErrorPage = (props: { title?: string; description?: string }) => (
  <div className={"flex h-full w-full flex-col items-center justify-center"}>
    <Card className={"w-full max-w-sm"}>
      <CardHeader>
        <CardTitle>{props.title ?? "Unexpected error!"}</CardTitle>
        <CardDescription>
          {props.description ??
            "An unexpected error occurred while loading! Check the console for more details."}
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
);

export const ObjectPage = (props: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}) => (
  <div className="flex h-full w-full flex-col gap-8 p-8">

    {(!!props.title || !!props.action || !!props.description) && (
      <div className="flex flex-row items-center justify-between overflow-hidden shrink-0">
        {(!!props.title || !!props.description) && (
          <div className="flex flex-col items-start">
            {props.title && (
              typeof props.title === "string" ?
                <H1 className="pb-0">{props.title}</H1> :
                props.title
            )}
            {props.description && (
              typeof props.description === "string" ?
                <p className="text-muted-foreground">{props.description}</p> :
                props.description
            )}
          </div>
        )}
        {props.action && props.action}
      </div>
    )}


    {!!props.children && (
      <div className="flex-1 min-h-0">
        {props.children}
      </div>
    )}
  </div>
);
