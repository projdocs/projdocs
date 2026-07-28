"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@packages/ui/components/drawer";
import { Button } from "@packages/ui/components/button";
import { PlusIcon } from "lucide-react";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@packages/ui/components/field";
import { Input } from "@packages/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ReactNode, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Enums } from "@packages/supabase";
import { toast } from "sonner";
import { supabase } from "@apps/web/lib/supabase/client";
import { StorageProviderTypes } from "@packages/shared/utilities/storage/type";
import { GetStorageProvidersResult } from "@apps/web/app/setup/actions";

const Permissions = {
  NONE: "None",
  VIEW: "Read-Only",
  EDIT: "Read & Edit",
  DELETE: "Read, Edit, & Delete",
} satisfies {
  [key in Enums<"permission_levels">]: string;
};

const PermissionsEnum: Enums<"permission_levels">[] = Object.keys(Permissions) as Enums<"permission_levels">[];

const organizationSchema = z.object({
  display: z.string().min(1, "A display name is required."),
  permission: z.enum(PermissionsEnum),
  storageProviderId: z.uuidv4(),
}).strict();

type OrganizationSchema = z.infer<typeof organizationSchema>;

export const CreateOrganizationDrawer = (props: {
  trigger?: ReactNode;
  onCreateAction?: () => unknown;
  providers: Awaited<GetStorageProvidersResult>["data"];
}) => {

  const form = useForm<OrganizationSchema>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      display: "",
      permission: "VIEW",
      storageProviderId: props.providers?.at(0)?.id ?? "",
    },
  });

  const closeButton = useRef<HTMLButtonElement>(null);

  async function handleSubmit(values: OrganizationSchema) {
    const id = toast.loading("Creating organization...");
    try {
      const token = (await supabase().auth.getSession()).data.session?.access_token;
      const response = await fetch(`${window.projdocs.PROJDOCS_API_URL}/v1/organizations`, {
        method: "POST",
        body: JSON.stringify({
          name: values.display,
          default_permission: values.permission,
          storage: {
            provider: {
              id: values.storageProviderId
            }
          }
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const description = body?.error ?? `HTTP ${response.status}`;
        toast.error("Failed to create organization!", { id, description });
        return;
      }

      toast.success(`Organization "${values.display}" created!`, { id });
      props.onCreateAction?.();
      closeButton.current?.click();
      form.reset();
    } catch (e) {
      console.error(e);
      toast.error("Failed to create organization!", {
        id,
        description: "Check the browser console for more details.",
      });
    }
  }

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        {props.trigger ?? (
          <Button>
            <PlusIcon />
            {"Add Organization"}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="fixed inset-y-0 right-0 flex h-full w-full max-w-lg flex-col rounded-none">

        <DrawerHeader className="border-b px-6 py-4">
          <DrawerTitle>Create organization</DrawerTitle>
          <DrawerDescription>
            Organizations group clients, projects, and files under independent numbering schemes.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form
            id="org-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
          >
            <FieldGroup className="gap-4">

              <Controller
                name="display"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="org-display">Name</FieldLabel>
                    <Input
                      {...field}
                      id="org-display"
                      placeholder="Acme Corp"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="storageProviderId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="org-storage">Storage provider</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                    >
                      <SelectTrigger
                        id="org-storage"
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {props.providers?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.display} — {StorageProviderTypes[p.type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Where files for this organization will be stored.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="permission"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="org-permission">Default member permissions</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="org-permission"
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PermissionsEnum.map((key) => (
                          <SelectItem key={key} value={key}>
                            {Permissions[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      The access level granted to organization members by default.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

            </FieldGroup>
          </form>
        </div>

        <DrawerFooter className="border-t px-6 py-4">
          <div className="flex justify-end gap-2">
            <DrawerClose asChild>
              <Button ref={closeButton} type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
            <Button
              type="submit"
              form="org-form"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating…" : "Create organization"}
            </Button>
          </div>
        </DrawerFooter>

      </DrawerContent>
    </Drawer>
  );
};
