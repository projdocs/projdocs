import { createClient } from "@workspace/supabase/client";
import { useNavigate, useParams } from "react-router";
import React, { useState } from "react";
import { ProjectPage } from "@workspace/ui/pages/project";
import { FileBrowserEventTypes, useFileBrowserEvent } from "@workspace/web/components/file-browser-table";
import { Tables } from "@workspace/supabase/types.gen";
import { P } from "@workspace/ui/components/text";
import { DirectoryWrapper } from "@workspace/word/surfaces/folder-picker/src/directory-wrapper";



export const Project = () => {

  const supabase = createClient();
  const navigate = useNavigate();
  const params = useParams();

  return (

    <DirectoryWrapper>
      <ProjectPage
        navigate={navigate}
        supabase={supabase}
        clientID={params.clientID ?? ""}
        projectID={params.projectID ?? ""}
        disableFileSelection={true}
      />
    </DirectoryWrapper>
  );

};