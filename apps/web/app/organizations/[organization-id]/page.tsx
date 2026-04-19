import { H1 } from "@packages/ui/components/typography";

export default async function Page(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {
  return (
    <div className={"flex w-full flex-col p-16"}>
      <H1>{"Welcome back, "}</H1>
    </div>
  );
}
