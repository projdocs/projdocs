import * as React from "react";
import { DirectoryPage } from "@workspace/ui/pages/directory";
import { createClient } from "@workspace/supabase/client";
import { useNavigate, useParams } from "react-router";



export const Directory = () => {

  const supabase = createClient();
  const navigate = useNavigate();
  const params = useParams();

  return (
    <DirectoryPage
      navigate={navigate}
      supabase={supabase}
      clientID={params.clientID ?? ""}
      projectID={params.projectID ?? ""}
      directoryID={params.directoryID ?? ""}
    />
  );

};