import { Step, StepComponentProps } from "@workspace/admin/components/setup-projdocs/types.ts";
import { DatabaseZap, Eye, EyeOff, Shuffle } from "lucide-react";
import { Label } from "@workspace/ui/components/label.tsx";
import { defaultSetupProjDocsState, SetupProjDocsState } from "@workspace/admin/components/setup-projdocs/store.ts";
import { Input } from "@workspace/ui/components/input.tsx";
import { toast } from "sonner";
import { testDbConnection } from "@workspace/admin/components/setup-projdocs/actions.ts";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip.tsx";
import { Button } from "@workspace/ui/components/button.tsx";
import { P } from "@workspace/ui/components/text.tsx";
import { random } from "@workspace/admin/lib/random.ts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs.tsx";
import { Separator } from "@workspace/ui/components/separator.tsx";



const DBPasswordInput = (props: StepComponentProps) => {

  const [ visible, setVisible ] = useState<boolean>(false);

  return (
    <div className="space-y-2 w-full">
      <Label>Password</Label>
      <div className={"flex flex-row w-full gap-4"}>
        <Input
          className={"flex-1 min-w-0 max-w-none"}
          type={visible ? "text" : "password"}
          placeholder={visible ? "Enter Password" : "••••••••"}
          value={props.store.state.database.password}
          onChange={(e) => props.store.set("database", "password", e.target.value)}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setVisible(visible => !visible)} variant={"outline"} size={"icon"}>
              {visible
                ? <EyeOff/>
                : <Eye/>
              }
            </Button>
          </TooltipTrigger>
        </Tooltip>
        {props.store.state.database.mode === "self-hosted" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"outline"}
                size={"icon"}
                onClick={() => props.store.set("database", "password", random.string(32))}
              >
                <Shuffle/>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <P>{"Generate Random Password"}</P>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export const setupDatabase: Step = {
  title: "Database",
  icon: DatabaseZap,
  component: (props) => (
    <div className="space-y-6 w-full">

      {/* Mode Selector */}
      <div className="space-y-2 w-full">
        <Label>Database Mode</Label>
        <Tabs
          className={"w-full"}
          value={props.store.state.database.mode}
          onValueChange={(e) => props.store.replace("database", ({
            ...defaultSetupProjDocsState.database,
            mode: e as unknown as SetupProjDocsState["database"]["mode"],
            password: (e as unknown as SetupProjDocsState["database"]["mode"]) === "remote" ? "" : random.string(32)
          }))}
        >
          <TabsList className={"w-full mb-4"}>
            <TabsTrigger
              className={"w-full"}
              value={"self-hosted" satisfies SetupProjDocsState["database"]["mode"]}
            >
              {"Self-Hosted"}
            </TabsTrigger>
            <TabsTrigger
              className={"w-full"}
              value={"remote" satisfies SetupProjDocsState["database"]["mode"]}
            >
              {"Remote"}
            </TabsTrigger>
          </TabsList>
          <TabsContent value={"self-hosted" satisfies SetupProjDocsState["database"]["mode"]}>
            <div className="space-y-4">
              <DBPasswordInput {...props} />
            </div>
          </TabsContent>
          <TabsContent value={"remote" satisfies SetupProjDocsState["database"]["mode"]}>
            <div className="space-y-4">

              {/* HOST */}
              <div className="space-y-2">
                <Label>Host</Label>
                <Input
                  placeholder="127.0.0.1"
                  value={props.store.state.database.host}
                  onChange={(e) =>
                    props.store.set("database", "host", e.target.value)
                  }
                />
              </div>

              {/* PORT */}
              <div className="space-y-2">
                <Label>Port</Label>
                <Input
                  placeholder="5432"
                  value={props.store.state.database.port}
                  onChange={(e) =>
                    props.store.set("database", "port", e.target.value)
                  }
                />
              </div>

              {/* DATABASE NAME */}
              <div className="space-y-2">
                <Label>Database Name</Label>
                <Input
                  placeholder="postgres"
                  value={props.store.state.database.database}
                  onChange={(e) =>
                    props.store.set("database", "database", e.target.value)
                  }
                />
              </div>

              {/* USERNAME */}
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  placeholder="postgres"
                  value={props.store.state.database.username}
                  onChange={(e) =>
                    props.store.set("database", "username", e.target.value)
                  }
                />
              </div>

              <DBPasswordInput {...props} />

            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
  beforeNext: async (store) => {

    if (!store.state.database.password.trim()) {
      toast.error("Invalid Database Password!", { description: `Provided value is empty` });
      return false;
    }

    const test = await testDbConnection(store.state.database);
    if (!test.success) toast.error("Database connection failed", { description: test.error });
    return test.success;
  }
};