import * as React from "react";
import { DirectoryPage } from "@workspace/ui/pages/directory";
import { createClient } from "@workspace/supabase/client";
import { useNavigate, useParams } from "react-router";
import { FileBrowserEventTypes, useFileBrowserEvent } from "@workspace/web/components/file-browser-table";
import { DirectoryWrapper } from "@workspace/word/surfaces/folder-picker/src/directory-wrapper";



export const Directory = () => {

  const supabase = createClient();
  const navigate = useNavigate();
  const params = useParams();

  return (
    <DirectoryWrapper>
      <DirectoryPage
        navigate={navigate}
        supabase={supabase}
        clientID={params.clientID ?? ""}
        projectID={params.projectID ?? ""}
        directoryID={params.directoryID ?? ""}
        disableFileSelection={true}
      />
    </DirectoryWrapper>
  );

};