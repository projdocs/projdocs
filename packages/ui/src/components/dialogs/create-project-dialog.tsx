"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@packages/ui/components/field";
import { Input } from "@packages/ui/components/input";
import { Button } from "@packages/ui/components/button";
import { toast } from "sonner";
import { ReactNode, useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";
import { ProjectsTable } from "@packages/ui/components/projects-table";
import { useLibraryRouter } from "@packages/ui/routing";
import { useLibrarySupabase } from "@packages/ui/lib/supabase-adapter";
import { Tables } from "@packages/supabase";
import { ObjectCombobox } from "@packages/ui/components/comboboxes/primitive";



const formSchema = z.object({
  display: z.string().min(1, "Name is required"),
  client: z.object({
    display: z.string(),
    id: z.string(),
    number: z.number(),
    rank: z.number(),
  }).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateProjectDialogProps {
  trigger?: ReactNode;
  organizationID: string;
  apiURL: string;
  client?: Tables<"clients">;
}

export function CreateProjectDialog(props: CreateProjectDialogProps) {

  const router = useLibraryRouter();
  const supabase = useLibrarySupabase();

  const [ open, setOpen ] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      display: "",
      client: null,
    },
  });

  async function handleSubmit(values: FormValues) {
    const id = toast.loading("Creating project...");
    try {
      const response = await fetch(`${props.apiURL}/v1/organizations/${props.organizationID}/projects`, {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ""}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        toast.success("Project created successfully!", {
          id,
          action: {
            label: "View",
            onClick: () => {
              router.navigate(`/organizations/${props.organizationID}/projects/${data.id}`);
              toast.dismiss(id);
            },
          },
        });
        useEventListener.RemoteDispatch(ProjectsTable.RefreshEvent, () => {});
        form.reset();
        setOpen(false);
        return;
      }

      const { error } = await response.json();
      throw error;
    } catch (err) {
      toast.error("Unable to create project!", {
        id,
        description: err instanceof Error ? err.message : typeof err === "string" ? err : undefined,
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button><PlusIcon />{"Create Project"}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Give your project a name to get started.
          </DialogDescription>
        </DialogHeader>

        <form className={"flex flex-col gap-4"} id="create-project-form" onSubmit={form.handleSubmit(handleSubmit)}
              noValidate>
          <Controller
            name="display"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="project-display">Name</FieldLabel>
                <Input
                  {...field}
                  id="project-display"
                  placeholder="My Project"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  autoFocus
                />
                {fieldState.invalid && (
                  <FieldError errors={[ fieldState.error ]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="client"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="client-display">Client</FieldLabel>
                <ObjectCombobox
                  nullable
                  table={"clients"}
                  value={field.value}
                  setValue={value => form.setValue("client", value)}
                  organizationID={props.organizationID}
                />
                {fieldState.invalid && (
                  <FieldError errors={[ fieldState.error ]} />
                )}
              </Field>
            )}
          />
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="create-project-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating…" : "Create project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}