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
import { ReactNode, useState } from "react";
import { PlusIcon } from "lucide-react";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";
import { ClientsTable } from "@packages/ui/components/clients-table";
import { useLibraryRouter } from "@packages/ui/routing";
import { useLibrarySupabase } from "@packages/ui/lib/supabase-adapter";



const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateClientDialogProps {
  trigger?: ReactNode;
  organizationID: string;
  projdocsApiUrl: string;
}

export function CreateClientDialog(props: CreateClientDialogProps) {

  const supabase = useLibrarySupabase();
  const router = useLibraryRouter();

  const [ open, setOpen ] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function handleSubmit(values: FormValues) {
    const id = toast.loading("Creating client...");
    try {
      const response = await fetch(`${props.projdocsApiUrl}/v1/organizations/${props.organizationID}/clients`, {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ""}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        toast.success("Client created successfully!", {
          id,
          action: {
            label: "View",
            onClick: () => {
              router.navigate(`/organizations/${props.organizationID}/clients/${data.id}`);
              toast.dismiss(id);
            },
          },
        });
        useEventListener.RemoteDispatch(ClientsTable.RefreshEvent, () => {});
        form.reset();
        setOpen(false);
        return;
      }

      const { error } = await response.json();
      throw error;
    } catch (err) {
      toast.error("Unable to create client!", {
        id,
        description: err instanceof Error ? err.message : typeof err === "string" ? err : undefined,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => {
      if (!next) form.reset();
      setOpen(next);
    }}>
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button><PlusIcon />{"Create Client"}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create client</DialogTitle>
          <DialogDescription>
            Give your client a name to get started.
          </DialogDescription>
        </DialogHeader>

        <form id="create-client-form" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          <Controller
            name={"name"}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="client-display">Name</FieldLabel>
                <Input
                  {...field}
                  id="client-display"
                  placeholder="My Client"
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
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="create-client-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating…" : "Create client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}