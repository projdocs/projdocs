import "client-only";
import { ProjDocsAPI } from "@apps/web/lib/api/index";
import { Tables } from "@packages/supabase";
import { toast } from "sonner";
import { Progress } from "@packages/ui/components/progress";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";



export class ProjDocsAPIClient extends ProjDocsAPI {

  static from(host: string) {
    return new ProjDocsAPIClient(host);
  }


  async uploadVersion(file: File, props: {
    file: Pick<Tables<"files">, "id" | "folder_id">;
    organization: Pick<Tables<"organizations">, "id">;
  }): Promise<boolean> {
    const toastId = toast.loading(`Uploading ${file.name}...`);

    const { error, id } = await super._uploadVersion(file, {
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
    toast.success(`${file.name} uploaded successfully`, {
      id: toastId,
    });
    return true;
  }

  public async uploadFile(file: File, props: {
    organization: Pick<Tables<"organizations">, "id">;
    folder: Pick<Tables<"folders">, "id">;
    router: AppRouterInstance;
  }): Promise<boolean> {

    const toastId = toast.loading(`Uploading ${file.name}...`);

    const { error, id } = await super._uploadFile(file, {
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
          props.router.push(`/organizations/${props.organization.id}/files/${id}`);
          toast.dismiss(toastId);
        },
      },
      id: toastId,
    });
    return true;
  }
}