import { H2, H3 } from "@packages/ui/components/typography";
import { Card, CardContent } from "@packages/ui/components/card";
import {
  ServiceStatusIndicator,
  ServiceStatusIndicatorProps,
  ServiceStatusIndicatorValue,
} from "@apps/admin/components/service-status-indicator";

type StatusGroup = {
  title: string;
  indicators: readonly ServiceStatusIndicatorProps[];
}

const indicators: readonly StatusGroup[] = [
  {
    title: "ProjDocs",
    indicators: [
      {
        display: "Version",
        value: {
          status: !process.env.PROJDOCS_VERSION ? "UNHEALTHY" : "HEALTHY",
          text: process.env.PROJDOCS_VERSION ?? "not-set",
        },
      },
    ],
  },
  {
    title: "Supabase",
    indicators: [
      {
        display: "Auth (GoTrue)",
        value: async () =>
          fetch(`${process.env.SUPABASE_KONG_URL}/auth/v1/health`)
            .then(async (r) => {
              const body = await r.text();
              console.log(body)
              try {
                return await JSON.parse(body);
              } catch (error) {
                console.error(r.status + ": " + body)
                return {
                  status: "UNHEALTHY",
                  text: "Check browser console",
                } satisfies ServiceStatusIndicatorValue;
              }
            })
            .then(
              (v) =>
                ({
                  status: "version" in v ? "HEALTHY" : "UNHEALTHY",
                  text: "version" in v ? v.version : undefined,
                }) satisfies ServiceStatusIndicatorValue
            )
            .catch((e) => {
              console.error(e);
              return {
                status: "UNHEALTHY",
                text: "Check browser console",
              } satisfies ServiceStatusIndicatorValue;
            }),
      },
    ],
  },
];

export default function () {
  return (
    <div className={"flex w-full flex-col p-8 gap-2"}>
      <H2>{"System Status"}</H2>
      <Card>
        <CardContent className={"flex flex-col gap-4"}>
          { indicators.map((group, index) => (
            <div key={`StatusGroup[${index}]`} className={"flex flex-col gap-2"}>
              <H3>{group.title}</H3>
              {group.indicators.map((indicator, indicatorIndex) => (
                <ServiceStatusIndicator
                  key={`StatusGroup[${index}][${indicatorIndex}]`}
                  {...indicator}
                />
              ))}
            </div>
          )) }
        </CardContent>
      </Card>
    </div>
  );
}
