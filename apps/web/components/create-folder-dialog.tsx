"use client";

import { ChangeEvent, ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui/components/dialog";
import { Button } from "@packages/ui/components/button";
import { Input } from "@packages/ui/components/input";
import { Label } from "@packages/ui/components/label";
import { FolderPlus } from "lucide-react";
import { supabase } from "@apps/web/lib/supabase/client";
import { toast } from "sonner";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";



const FOLDER_NAME_REGEX = /^[a-zA-Z0-9_\-\.][a-zA-Z0-9 _\-\.]*$/;

function validateFolderName(name: string): string | null {
  if (!name.trim()) return "Folder name is required.";
  if (!FOLDER_NAME_REGEX.test(name)) return "Name may only contain letters, numbers, spaces, hyphens, underscores, and dots, and must not start with a space.";
  if (name.length > 255) return "Folder name must be 255 characters or fewer.";
  return null;
}

type Props = {
  trigger?: ReactNode;
} & ({
  project_id: string;
} | {
  organization_id: string;
} | {
  client_id: string;
})

const REFRESH_EVENT = "create-folder-dialog:folder:created";

export const CreateFolderDialog = ({ trigger, ...props }: Props) => {
  const [ open, setOpen ] = useState(false);
  const [ name, setName ] = useState("");
  const [ error, setError ] = useState<string | null>(null);
  const [ loading, setLoading ] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    setError(validateFolderName(e.target.value));
  }

  async function handleConfirm() {
    const err = validateFolderName(name);
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      await supabase().from("folders").insert({
        name: name.trim(),
        ...props,
      }).then(({ error }) => {
        if (error) toast.error("Unable to Create Folder!", {
          description: error.message,
        });
        else useEventListener.RemoteDispatch(REFRESH_EVENT, () => {});
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setError(null);
    }
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 py-2">
          <Label htmlFor="folder-name">Folder name</Label>
          <Input
            id="folder-name"
            value={name}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleConfirm()}
            placeholder="e.g. Contracts 2026"
            autoFocus
            aria-invalid={!!error}
            aria-describedby={error ? "folder-name-error" : undefined}
          />
          {error && (
            <p id="folder-name-error" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!!error || !name.trim() || loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

CreateFolderDialog.RefreshEvent = REFRESH_EVENT;