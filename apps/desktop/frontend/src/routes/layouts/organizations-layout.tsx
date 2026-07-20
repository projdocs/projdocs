import { LibraryRouterProvider } from "@packages/ui/routing";
import DashboardLayout, { DashboardLayoutProps } from "@packages/ui/layouts/dashboard";
import { Outlet, useNavigate } from "react-router";
import { useReactRouterAdapter } from "@packages/ui/routing/adapters/react-router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Skeleton } from "@packages/ui/components/skeleton";
import { supabase } from "@apps/desktop/lib/supabase";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";



export const OrganizationsLayout = () => {

  const navigate = useNavigate();
  const { organizationID } = useParams<{ organizationID: string }>();
  const adapter = useReactRouterAdapter();
  const [ state, _setState ] = useState<Omit<DashboardLayoutProps, "children"> | undefined>();
  const setState = useDebouncedCallback<Dispatch<SetStateAction<typeof state>>>(v => _setState(v));

  useEffect(() => {
    (async () => {


      const { data, error } = await supabase().auth.getClaims();
      if (error) throw error.message;
      if (data === null) {
        navigate("/auth/login");
        return;
      }
      const { claims } = data;

      const { data: organizations, error: orgError } = await supabase()
        .from("organizations")
        .select();
      const organization = organizations?.find(({ id }) => id === organizationID);

      if (orgError || !organization) return toast.error("Unable to load organization!", {
        description: "An error occurred while loading the selected organization.",
      });

      const profile = await supabase()
        .from("profiles")
        .select()
        .eq("user_id", claims.sub)
        .eq("organization_id", organization.id)
        .single();
      if (profile.error) return toast.error("Unable to load profile!", {
        description: "An error occurred while loading the current user's profile.",
      });

      setState({
        organization,
        organizations,
        user: {
          profile: profile.data,
          data: claims,
        },
      });

    })().catch((e) => {
      console.error(e);
      toast.error("An unexpected error occurred!", {
        description: "An error occurred while loading the current user.",
      });
    });
  }, [ organizationID ]);

  if (state === undefined) return (
    <Skeleton className={"w-full h-full"} />
  );

  return (
    <LibraryRouterProvider adapter={adapter}>
      <DashboardLayout
        {...state}
        topOffset={"pt-10 bg-sidebar"}
      >
        <Outlet />
      </DashboardLayout>
    </LibraryRouterProvider>
  );
};