"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@packages/ui/components/field";
import { Input } from "@packages/ui/components/input";
import { Button } from "@packages/ui/components/button";
import { ReactNode } from "react";
import { Viewable } from "@apps/web/components/file-viewer/types";
import { supabase } from "@apps/web/lib/supabase/client";
import { toast } from "sonner";



const schema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[a-zA-Z0-9 _\-\.]+$/, "Invalid characters in filename"),
});

type Schema = z.infer<typeof schema>;

interface RenameDialogProps {
  viewable: Viewable;
  children: ReactNode;
}

export function RenameDialog(props: RenameDialogProps) {
  const {
    handleSubmit,
    control,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: props.viewable.name },
  });

  async function onSubmit({ name }: Schema) {
    const { error } = await supabase()
      .from(props.viewable.type === "FOLDER" ? "folders" : "files")
      .update({ name })
      .eq("id", props.viewable.id)
      .select()
      .single();
    if (error) toast.error("Unable to update name!", {
      description: error.message,
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="file-name">Filename</FieldLabel>
                <Input
                  {...field}
                  id="file-name"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[ fieldState.error ]} />
                )}
              </Field>
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Rename</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}