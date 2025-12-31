import { Step } from "@workspace/web/app/setup/types";
import { CircleCheckBigIcon } from "lucide-react";
import { H4, P } from "@workspace/ui/components/text";
import { createClient } from "@workspace/supabase/client";



export const SetupComplete: Step = {
  title: "Complete",
  icon: CircleCheckBigIcon,
  component: () => {
    return (
      <div className={"w-full flex flex-col gap-4"}>

        <div className={"flex flex-col justify-center items-center"}>
          <H4>{"Setup Complete!"}</H4>
          <P className={"text-muted-foreground"}>
            {"ProjDocs is configured and ready to use. Click the finish button to continue."}
          </P>
        </div>
      </div>
    );
  },
  beforeNext: async (store) => {
    const supabase = createClient();

    // update the company object
    const { error } = await supabase.from("company").update({
      is_setup: true,
    }).eq("id", true).single();

    if (error) return {
      canContinue: false,
      error: `failed to update company: ${error.message}`
    };

    return {
      canContinue: true,
    };
  },
};