import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { H3 } from "@workspace/ui/components/text";



export const ErrorPage = (props: {
  title: string;
  description: string;
}) => (
  <div className={"flex flex-col items-center justify-center w-full h-full overflow-scroll"}>

    <Card className={"w-1/2"}>
      <CardHeader>
        <H3>{props.title}</H3>
      </CardHeader>
      <CardContent>{props.description}</CardContent>
    </Card>

  </div>
);