"use client";

import { H2, H4, P } from "@workspace/ui/components/text";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from "@workspace/ui/components/stepper";
import {
  Check,
  KeyRoundIcon,
  LayoutListIcon,
  LoaderCircleIcon,
  LucideIcon,
  QrCodeIcon,
  ShieldCheckIcon
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { MFAEnrollParams } from "@supabase/supabase-js";
import { createClient } from "@workspace/supabase/client";
import { useRouter } from "next/navigation";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Spinner } from "@workspace/ui/components/spinner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@workspace/ui/components/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";



type AvailableMethod = {
  title: string;
  value: MFAEnrollParams["factorType"];
  icon: LucideIcon;
}

const QRCodeMethod: AvailableMethod = {
  title: "One-Time Passcode (OTP)",
  icon: QrCodeIcon,
  value: "totp"
};

const WebAuthnMethod: AvailableMethod = {
  title: "Security Key",
  icon: KeyRoundIcon,
  value: "webauthn",
};

type EnrolledMethod = AvailableMethod & {
  friendlyName: string;
  id: string;
}

const EnrolledMFA = (props: EnrolledMethod & {
  onClick: () => Promise<void>;
}) => (
  <Card
    onClick={props.onClick}
    className={"w-full transition-colors hover:bg-muted cursor-pointer"}>
    <CardHeader className={"flex flex-row items-center gap-4"}>
      <props.icon className={"w-[50px] h-[50px] shrink-0"}/>
      <div className={"flex flex-col"}>
        <CardTitle>{props.friendlyName}</CardTitle>
        <CardDescription>{props.title}</CardDescription>
      </div>
    </CardHeader>
  </Card>
);

const QRCodeChallengeAndVerify = (props: {
  method: EnrolledMethod;
}) => {

  const router = useRouter();
  const [value, setValue] = useState<string>("");

  return (
    <div className={"w-full flex flex-col items-center justify-center mb-4 gap-8"}>

      <div className={"w-full flex flex-col items-center justify-center"}>
        <H4>{"Enter Code"}</H4>
        <P className={"text-center w-1/2"}>{"Enter the 6-digit code from your authenticator application below to continue."}</P>
      </div>

      <InputOTP
        value={value}
        onChange={setValue}
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0}/>
          <InputOTPSlot index={1}/>
          <InputOTPSlot index={2}/>
          <InputOTPSlot index={3}/>
          <InputOTPSlot index={4}/>
          <InputOTPSlot index={5}/>
        </InputOTPGroup>
      </InputOTP>

      <Button
        disabled={value.length !== 6}
        className={"w-[216px]"}
        onClick={async () => {

          const supabase = createClient();
          const verify = await supabase.auth.mfa.challengeAndVerify({
            code: value,
            factorId: props.method.id,
          })
          if (verify.error) {
            toast.error("Unable to Verify Code!", { description: verify.error.message })
            return;
          }
          router.push("/dashboard");
        }}
      >
        {"Verify"}
      </Button>
    </div>
  );

};

const WebAuthnChallengeAndVerify = (props: {
  method: EnrolledMethod
}) => {

  const router = useRouter();
  const [ error, setError ] = useState<{ title: string; description: string; }>();

  const challengeAndVerify = () => {

    setError(undefined);

    const supabase = createClient();
    supabase.auth.mfa.webauthn.challenge({
      factorId: props.method.id, webauthn: {
        rpId: window.env.HOSTNAME,
        rpOrigins: [ origin.toString().replace(/\/$/, "") ]
      }
    }).then(async ({ data, error }) => {

      if (error) {
        setError({ title: "Unable to Challenge Authenticator!", description: error.message });
        return;
      }

      const verify = await supabase.auth.mfa.verify({
        factorId: props.method.id,
        challengeId: data.challengeId,
        webauthn: {
          ...data.webauthn,
          rpId: window.env.HOSTNAME,
          rpOrigins: [ origin.toString().replace(/\/$/, "") ]
        }
      });

      if (verify.error) {
        setError({ title: "Unable to Verify Authenticator!", description: verify.error.message });
        return;
      }

      router.push("/dashboard");
    });
  };

  // run once on mount
  useEffect(challengeAndVerify, []);

  if (error === undefined) return (<Spinner/>);

  return (
    <Card className={"w-full"}>
      <CardHeader>
        <CardTitle>{error.title}</CardTitle>
        <CardDescription>{error.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={challengeAndVerify} className={"w-full"}>{"Retry"}</Button>
      </CardFooter>

    </Card>
  );

};

const steps: ReadonlyArray<{
  title: string;
  icon: LucideIcon;
  component: (props: {
    method: EnrolledMethod | undefined,
    setMethod: Dispatch<SetStateAction<EnrolledMethod | undefined>>;
    methods: readonly EnrolledMethod[] | undefined;
    next: () => Promise<void>;
  }) => ReactNode;
  disableNext?: boolean;
}> = [
  {
    title: "Method",
    icon: LayoutListIcon,
    disableNext: true,
    component: ({ methods, next, setMethod }) => (
      <div className={"w-full flex flex-col items-center gap-2"}>

        <H4>
          {"Select an Authenticator"}
        </H4>

        {methods === undefined ? (
          <Skeleton className={"h-[100px] w-full"}/>
        ) : (
          methods.map((method, i) => (
            <EnrolledMFA
              key={i}
              {...method}
              onClick={async () => {
                setMethod(method);
                await next();
              }}
            />
          ))
        )}
      </div>
    )
  },
  {
    title: "Verify",
    icon: ShieldCheckIcon,
    disableNext: true,
    component: (props) => {
      switch (props.method?.value) {
        case "webauthn":
          return (<WebAuthnChallengeAndVerify method={props.method}/>);
        case "totp":
          return (<QRCodeChallengeAndVerify method={props.method}/>);
        default:
          return (<Spinner/>);
      }
    }
  }
];

export default function Page() {

  const router = useRouter();
  const [ currentStep, setCurrentStep ] = useState<number>(1);
  const [ methods, setMethods ] = useState<readonly EnrolledMethod[]>();
  const [ method, setMethod ] = useState<EnrolledMethod>();

  const next = async () => {
    if (currentStep === steps.length) router.push("/dashboard");
    else setCurrentStep((prev) => prev + 1);
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (error) {
        toast.error("Failed to list factors", { description: error.message });
        return;
      }
      if (data.all.length < 1) router.push("/auth/mfa/enroll");
      const webauthnMethods: EnrolledMethod[] = data.webauthn.map(method => ({
        ...WebAuthnMethod,
        friendlyName: method.friendly_name!,
        id: method.id
      }));
      const qrCodeMethods: EnrolledMethod[] = data.totp.map(method => ({
        ...QRCodeMethod,
        friendlyName: method.friendly_name!,
        id: method.id
      }));
      setMethods([ ...webauthnMethods, ...qrCodeMethods ]);
    });
  }, []);

  const disableNext = steps[currentStep-1]!.disableNext



  return (
    <div className={"flex flex-col w-full min-h-full overflow-scroll justify-center items-center p-4 py-12 gap-4"}>

      <div className={"flex flex-col items-center justify-center"}>
        <H2>{"Verify MFA"}</H2>
        <P>{"Verify using a multi-factor authentication option to continue"}</P>
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
                  <step.component
                    next={next}
                    method={method}
                    methods={methods}
                    setMethod={setMethod}
                  />
                </StepperContent>
              ))}

            </StepperPanel>
            <div className="flex items-center justify-between gap-2.5">
              { currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={async () => setCurrentStep((prev) => prev - 1)}
                >
                  {"Previous"}
                </Button>
              ) }
              {!disableNext && (
                <Button
                  variant="outline"
                  onClick={next}
                >
                  {currentStep >= steps.length ? "Finish" : "Next"}
                </Button>
              )}
            </div>
          </Stepper>
        </CardContent>
      </Card>
    </div>
  );
}