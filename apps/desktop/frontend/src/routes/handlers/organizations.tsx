import { useEffect, useState } from "react";
import { supabase } from "@apps/desktop/lib/supabase";
import { toast } from "sonner";
import { Tables } from "@packages/supabase";
import { useDebouncedCallback } from "use-debounce";
import { Skeleton } from "@packages/ui/components/skeleton";
import { Card, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { useNavigate } from "react-router";



export default function OrganizationsHandler() {

  const navigate = useNavigate();
  const [organizations, _setOrganizations] = useState<readonly Tables<"organizations">[] | undefined>();
  const setOrganizations = useDebouncedCallback<(v: typeof organizations) => unknown>(_setOrganizations, 500)

  useEffect(() => {
    supabase().from("organizations").select().then(({ data, error }) => {
      if (error) toast.error("Unable to load organizations!", {
        description: error.message,
      });
      else {
        setOrganizations(data);
        if(data.length > 0) navigate(`/organizations/${data[0]!.id}`);
      }
    });
  }, []);

  if(organizations && organizations.length === 0) return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className={"w-full max-w-sm"}>
        <CardHeader>
          <CardTitle>{"No Organizations!"}</CardTitle>
          <CardDescription>
            {
              "You do not have access to any organizations (or none have been configured yet)."
            }
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );

  return (
    <Skeleton
      className={"w-dvw h-dvh"}
    />
  )
}