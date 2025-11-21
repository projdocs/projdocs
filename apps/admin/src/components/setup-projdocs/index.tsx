"use client";
import { Card, CardContent } from "@workspace/ui/components/card.tsx";
import { H2, P } from "@workspace/ui/components/text.tsx";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@workspace/ui/components/stepper";
import { Check, LoaderCircleIcon } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge.tsx";
import { Button } from "@workspace/ui/components/button.tsx";
import { useState } from "react";
import { SetupProjDocsStore, useSetupProjDocsStore } from "@workspace/admin/components/setup-projdocs/store.ts";
import { steps } from "@workspace/admin/components/setup-projdocs/steps";
import { onComplete } from "@workspace/admin/components/setup-projdocs/actions.ts";
import { useRouter } from "next/navigation";



export const SetupProjDocs = ({platform}: {
  platform: NodeJS.Platform;
}) => {

  const [ currentStep, setCurrentStep ] = useState<number>(1);
  const store: SetupProjDocsStore = useSetupProjDocsStore();
  const router = useRouter();


  return (
    <div className={"flex flex-col w-full min-h-full overflow-scroll justify-center items-center p-4 py-12 gap-4"}>

      <div className={"flex flex-col items-center justify-center"}>
        <H2>{"Setup ProjDocs Server"}</H2>
        <P>{"Configure ProDocs Server to continue"}</P>
      </div>


      <Card className={"w-full md:w-1/2"}>
        <CardContent>
          <Stepper
            className="space-y-8"
            value={currentStep}
            onValueChange={setCurrentStep}
            indicators={{
              completed: <Check className="size-4"/>,
              loading: <LoaderCircleIcon className="size-4 animate-spin"/>,
            }}
          >
            <StepperNav className="gap-3 mb-15">
              {steps.map((step, index) => {
                return (
                  <StepperItem key={index} step={index + 1} className="relative flex-1 items-center">
                    <StepperTrigger className="flex flex-col items-center justify-center gap-2.5 grow" asChild>
                      <StepperIndicator
                        className="size-8 border-2 data-[state=completed]:text-white data-[state=completed]:bg-green-500 data-[state=inactive]:bg-transparent data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground">
                        <step.icon className="size-4"/>
                      </StepperIndicator>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="text-[10px] font-semibold uppercase text-muted-foreground">Step {index + 1}</div>
                        <StepperTitle
                          className="text-center text-base font-semibold group-data-[state=inactive]/step:text-muted-foreground">
                          {step.title}
                        </StepperTitle>
                        <div>
                          <Badge className="hidden group-data-[state=active]/step:inline-flex">
                            In Progress
                          </Badge>
                          <Badge className="hidden group-data-[state=completed]/step:inline-flex">
                            {"Completed"}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="hidden group-data-[state=inactive]/step:inline-flex text-muted-foreground"
                          >
                            Pending
                          </Badge>
                        </div>
                      </div>
                    </StepperTrigger>
                    {steps.length > index + 1 && (
                      <StepperSeparator
                        className="absolute top-4 inset-x-0 translate-x-[0.85rem] start-1/2 m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-0.95rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none  group-data-[state=completed]/step:bg-green-500"
                      />
                    )}
                  </StepperItem>
                );
              })}
            </StepperNav>
            <StepperPanel className="text-sm">
              {steps.map((step, index) => (
                <StepperContent key={index} value={index + 1}
                                className="flex flex-col items-center justify-center w-full">
                  <step.component store={store} osType={platform}/>
                </StepperContent>
              ))}

            </StepperPanel>
            <div className="flex items-center justify-between gap-2.5">
              <Button
                variant="outline"
                onClick={async () => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 1}
              >
                {"Previous"}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const action = steps[currentStep - 1]?.beforeNext;
                  const cont = action ? await action(store) : true;
                  if (!cont) return;
                  if (currentStep === steps.length) {
                    await onComplete(store);
                    router.push("/");
                  }
                  else setCurrentStep((prev) => prev + 1);
                }}
              >
                {currentStep >= steps.length ? "Finish" : "Next"}
              </Button>
            </div>
          </Stepper>
        </CardContent>
      </Card>
    </div>
  );
};