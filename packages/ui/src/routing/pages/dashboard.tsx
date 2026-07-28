import { ObjectPage } from "@packages/ui/components/page";
import { Tables } from "@packages/supabase";



export type DashboardPageProps = {
  user: Tables<"profiles">;
  member: Tables<"members">;
  organizationID: string;
}

export function DashboardPage(props: DashboardPageProps) {
  return (
    <ObjectPage title={`Welcome back, ${props.user.first_name}!`}>
      <div className={"flex flex-col gap-4"}>


      </div>
    </ObjectPage>
  );
}