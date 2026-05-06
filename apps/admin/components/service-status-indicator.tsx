
import { Badge, BadgeVariant } from "@packages/ui/components/badge";
import { Spinner } from "@packages/ui/components/spinner";
import { Code } from "@packages/ui/components/typography";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";

export type ServiceStatusIndicatorValue = {
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY" | "STOPPED";
  text: string;
};

export type ServiceStatusIndicatorProps = {
  display: string;
  value:
    | ServiceStatusIndicatorValue
    | (() => Promise<ServiceStatusIndicatorValue>);
};

const getBadgeHint = (
  status: ServiceStatusIndicatorValue["status"] | undefined
): string => {
  switch (status) {
    case undefined:
      return "Status Loading...";
    case "HEALTHY":
      return "Service Healthy";
    case "DEGRADED":
      return "Service Degraded";
    case "UNHEALTHY":
      return "Service Unhealthy";
    case "STOPPED":
      return "Service Stopped";
  }
};

const getBadgeVariant = (
  status: ServiceStatusIndicatorValue["status"] | undefined
): BadgeVariant => {
  switch (status) {
    case undefined:
      return "ghost";
    case "HEALTHY":
      return "outline";
    case "DEGRADED":
      return "secondary";
    case "UNHEALTHY":
      return "destructive";
    case "STOPPED":
      return "default";
  }
};

export const ServiceStatusIndicator = async (props: ServiceStatusIndicatorProps) => {

  const value = typeof props.value === "function" ? await props.value() : props.value;

  return (
    <div className={"flex w-full flex-row justify-between items-center"}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getBadgeVariant(value?.status)}>
            {value === undefined && <Spinner data-icon="inline-start" />}
            {props.display}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {getBadgeHint(value?.status)}
        </TooltipContent>
      </Tooltip>

      <Code>{value.text}</Code>
    </div>
  );
};
