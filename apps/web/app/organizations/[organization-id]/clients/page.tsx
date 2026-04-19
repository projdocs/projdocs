import { H1 } from "@packages/ui/components/typography";



export default async function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {

  const params = await props.params;

  return (
    <div className={"flex w-full flex-col p-8"}>

      <H1>{"Clients"}</H1>

    </div>
  )

}