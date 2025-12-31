import { ReactNode } from "react";
import { createClient } from "@workspace/web/lib/supabase/server";
import { ErrorPage } from "@workspace/web/components/error-page";



export default async function Layout({ children }: { children: ReactNode }) {

  const supabase = await createClient();
  const company = await supabase.from("company").select().single();
  if (company.error !== null)
    return (
      <ErrorPage
        title={"Unable to Load Company"}
        description={company.error.message}
      />
    );

  return children;

}