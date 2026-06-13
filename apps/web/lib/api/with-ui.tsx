import "client-only";
import { ProjDocsAPI } from "@apps/web/lib/api/index";
import { Tables } from "@packages/supabase";
import { toast } from "sonner";
import { Progress } from "@packages/ui/components/progress";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { DownloadOptions } from "@apps/web/lib/api/download";



export class ProjDocsAPIClient extends ProjDocsAPI {

  static from(host: string) {
    return new ProjDocsAPIClient(host);
  }

  async download(
    organization: Pick<Tables<"organizations">, "id">,
    file: Pick<Tables<"files">, "folder_id" | "id" | "name">,
    version: Pick<Tables<"files_versions">, "id">,
    options: DownloadOptions = {},
  ) {
    const toastId = toast.loading(`Downloading ${file.name}...`);

    const result = await super.download(
      organization,
      file,
      version,
      {
        ...options,
        onProgress: (downloaded, total) => {
          const percent = Math.floor(downloaded / total * 100);
          toast.loading(
            <div className="flex flex-col gap-1 w-full min-w-[200px]">
              <span className="text-sm">{file.name}</span>
              <Progress value={percent} className="w-full" />
              <span className="text-xs text-muted-foreground">{percent}%</span>
            </div>,
            { id: toastId },
          );
        },
      },
    );

    if (result.error !== null) {
      toast.error(`Failed to download!`, { description: result.error, id: toastId });
      return result;
    }

    // complete the file upload
    toast.success(`${file.name} downloaded successfully`, {
      id: toastId,
    });
    return result;
  }


  async uploadVersion(file: File, props: {
    file: Pick<Tables<"files">, "id" | "folder_id">;
    organization: Pick<Tables<"organizations">, "id">;
    router: AppRouterInstance;
  }): Promise<boolean> {
    const toastId = toast.loading(`Uploading ${file.name}...`);

    const { error, data } = await super._uploadVersion(file, {
      organization: props.organization,
      file: props.file,
      onProgress: (percent) => toast.loading(
        <div className="flex flex-col gap-1 w-full min-w-[200px]">
          <span className="text-sm">{file.name}</span>
          <Progress value={percent} className="w-full" />
          <span className="text-xs text-muted-foreground">{percent}%</span>
        </div>,
        { id: toastId },
      ),
    });

    if (error !== null) {
      toast.error(`Failed to upload!`, { description: error, id: toastId });
      return false;
    }

    // complete the file upload
    props.router.refresh();
    toast.success(`${file.name} uploaded successfully`, {
      id: toastId,
      action: {
        label: "View",
        onClick: () => {
          props.router.push(`/organizations/${props.organization.id}/files/${data.file.id}?version-id=${data.version.id}`);
          toast.dismiss(toastId);
        },
      },
    });
    return true;
  }

  public async uploadFile(file: File, props: {
    organization: Pick<Tables<"organizations">, "id">;
    folder: Pick<Tables<"folders">, "id">;
    router: AppRouterInstance;
  }): Promise<boolean> {

    const toastId = toast.loading(`Uploading ${file.name}...`);

    const { error, data } = await super._uploadFile(file, {
      organization: props.organization,
      folder: props.folder,
      onProgress: (percent) => toast.loading(
        <div className="flex flex-col gap-1 w-full min-w-[200px]">
          <span className="text-sm">{file.name}</span>
          <Progress value={percent} className="w-full" />
          <span className="text-xs text-muted-foreground">{percent}%</span>
        </div>,
        { id: toastId },
      ),
    });

    if (error !== null) {
      toast.error(`Failed to upload!`, { description: error, id: toastId });
      return false;
    }

    // complete the file upload
    toast.success(`${file.name} uploaded successfully`, {
      action: {
        label: "View",
        onClick: () => {
          props.router.push(`/organizations/${props.organization.id}/files/${data.file.id}?version-id=${data.version.id}`);
          toast.dismiss(toastId);
        },
      },
      id: toastId,
    });
    return true;
  }
}