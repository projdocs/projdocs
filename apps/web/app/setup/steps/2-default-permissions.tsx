import { Step } from "@workspace/web/app/setup/types";
import { ShieldIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@workspace/ui/components/select";
import { Enums } from "@workspace/supabase/types.gen";
import { H4, P } from "@workspace/ui/components/text";
import { createClient } from "@workspace/supabase/client";



export const SetupDefaultPermissions: Step = {
  title: "Permissions",
  icon: ShieldIcon,
  beforeNext: async (store) => {
    const supabase = createClient();

    // update the company object
    const { error } = await supabase.from("company").update({
      default_clients_access: store.state.defaultPermissions.clients,
      default_projects_access: store.state.defaultPermissions.projects,
    }).eq("id", true).single();

    if (error) return {
      canContinue: false,
      error: `failed to update company: ${error.message}`
    };

    return {
      canContinue: true,
    };
  },
  component: (store) => {
    return (
      <div className={"w-full flex flex-col gap-4"}>

        <div>
          <H4>{"Default Permissions"}</H4>
          <P className={"text-muted-foreground"}>
            {"Set the default permission-level for newly created objects. This level can be overridden later on, either manually or based on custom rules."}
          </P>
        </div>

        <div>
          <P className={"font-bold"}>{"Clients"}</P>
          <Select value={store.state.defaultPermissions.clients} onValueChange={(level) => store.set("defaultPermissions", "clients", level as Enums<"access">)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a level"/>
            </SelectTrigger>
            <SelectContent className="group">
              <SelectGroup>
                <SelectItem value={"NONE" satisfies Enums<"access">}>
                  <div className={"flex flex-col"}>
                    <P>{"None"}</P>
                    <P
                      className={"text-muted-foreground hidden group-data-[state=open]:block"}>{"Users will not have any access to created clients."}</P>
                  </div>
                </SelectItem>
                <SelectItem value={"READ" satisfies Enums<"access">}>
                  <div className={"flex flex-col"}>
                    <P>{"View-Only"}</P>
                    <P
                      className={"text-muted-foreground hidden group-data-[state=open]:block"}>{"Users will only be able to view created clients."}</P>
                  </div>
                </SelectItem>
                <SelectItem value={"EDIT" satisfies Enums<"access">}>
                  <div className={"flex flex-col"}>
                    <P>{"View and Edit"}</P>
                    <P
                      className={"text-muted-foreground hidden group-data-[state=open]:block"}>{"Users will be able to view and edit created clients."}</P>
                  </div>
                </SelectItem>
                <SelectItem value={"DELETE" satisfies Enums<"access">}>
                  <div className={"flex flex-col"}>
                    <P>{"View, Edit, and Delete"}</P>
                    <P
                      className={"text-muted-foreground hidden group-data-[state=open]:block"}>{"(Not Recommended) Users will have full control to view, edit, and delete created clients."}</P>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <P className={"font-bold"}>{"Projects"}</P>
          <Select value={store.state.defaultPermissions.projects} onValueChange={(level) => store.set("defaultPermissions", "projects", level as Enums<"access">)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a level"/>
            </SelectTrigger>
            <SelectContent className="group">
              <SelectGroup>
                <SelectItem value={"NONE" satisfies Enums<"access">}>
                  <div className={"flex flex-col"}>
                    <P>{"None"}</P>
                    <P
                      className={"text-muted-foreground hidden group-data-[state=open]:block"}>{"Users will not have any access to created projects."}</P>
                  </div>
                </SelectItem>
                <SelectItem value={"READ" satisfies Enums<"access">}>
                  <div className={"flex flex-col"}>
                    <P>{"View-Only"}</P>
                    <P
                      className={"text-muted-foreground hidden group-data-[state=open]:block"}>{"Users will only be able to view created projects."}</P>
                  </div>
                </SelectItem>
                <SelectItem value={"EDIT" satisfies Enums<"access">}>
                  <div className={"flex flex-col"}>
                    <P>{"View and Edit"}</P>
                    <P
                      className={"text-muted-foreground hidden group-data-[state=open]:block"}>{"Users will be able to view and edit created projects."}</P>
                  </div>
                </SelectItem>
                <SelectItem value={"DELETE" satisfies Enums<"access">}>
                  <div className={"flex flex-col"}>
                    <P>{"View, Edit, and Delete"}</P>
                    <P
                      className={"text-muted-foreground hidden group-data-[state=open]:block"}>{"(Not Recommended) Users will have full control to view, edit, and delete created projects."}</P>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
};