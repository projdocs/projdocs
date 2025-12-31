import {
  ComputerIcon,
  KeyRoundIcon,
  LayoutListIcon,
  LucideIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  TextCursorInputIcon
} from "lucide-react";
import { ReactNode, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { H4, P } from "@workspace/ui/components/text";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { SetupMFAStore } from "@workspace/web/app/auth/mfa/enroll/store";
import { createClient } from "@workspace/supabase/client";
import { MFAEnrollParams } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Spinner } from "@workspace/ui/components/spinner";
import { useRouter } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@workspace/ui/components/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";



type AvailableMethod = {
  title: string;
  description: string;
  value: MFAEnrollParams["factorType"];
  icon: LucideIcon;
}

const availableMethods: ReadonlyArray<AvailableMethod> = [
  {
    title: "One-Time Passcode (OTP)",
    description: "Scan a QR-Code to receive time-sensitive, one-time codes on each login.",
    icon: QrCodeIcon,
    value: "totp"
  },
  {
    title: "Security Key",
    description: "Use a WebAuthn-compatible security key on each login.",
    icon: KeyRoundIcon,
    value: "webauthn",
  }
];

const AvailableMFA = (props: AvailableMethod & {
  currentValue: MFAEnrollParams["factorType"] | null;
  onValueChange: (value: MFAEnrollParams["factorType"]) => void;
}) => {

  return (
    <Card
      onClick={() => props.onValueChange(props.value)}
      className={"w-full transition-colors hover:bg-muted cursor-pointer"}>
      <CardHeader className={"flex flex-row items-center gap-4"}>

        <RadioGroup value={props.currentValue} onValueChange={props.onValueChange}>
          <RadioGroupItem value={props.value}/>
        </RadioGroup>

        <props.icon className={"w-[50px] h-[50px] shrink-0"}/>
        <div className={"flex flex-col"}>
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );

};

export const steps: ReadonlyArray<{
  title: string;
  icon: LucideIcon;
  component: (store: SetupMFAStore) => ReactNode;
  beforeNext?: (store: SetupMFAStore, router: AppRouterInstance) => Promise<{ canContinue: boolean; error?: string }>;
}> = [
  {
    title: "Type",
    icon: LayoutListIcon,
    beforeNext: async (store) => {
      if (store.state.options.type === null) return {
        canContinue: false,
        error: "Select an Authentication Type!"
      };
      return { canContinue: true };
    },
    component: (store) => {

      return (
        <div className={"w-full flex flex-col items-center gap-2"}>

          <H4>
            {"Select an Authentication Type"}
          </H4>

          {availableMethods.map((method, i) => (
            <AvailableMFA
              key={i}
              {...method}
              currentValue={store.state.options.type}
              onValueChange={(value) => store.set("options", "type", value)}
            />
          ))}
        </div>
      );

    },
  },
  {
    title: "Name",
    icon: TextCursorInputIcon,
    component: (store) => {

      return (
        <div className={"w-full gap-1 flex flex-col"}>

          <Label>{"Friendly Name"}</Label>
          <Input
            className={"w-full"}
            placeholder={"My Authenticator Device/Name"}
            value={store.state.options.name}
            onChange={e => store.set("options", "name", e.target.value)}
          />
          <P className={"text-muted-foreground"}>
            {"Enter a unique name that will help you identify this authentication device or application in the future."}
          </P>

        </div>
      );
    },
    beforeNext: async (store) => {
      if (!store.state.options.name.trim()) return {
        canContinue: false,
        error: "Enter a name!"
      };

      // gen qr code
      if (store.state.options.type === "totp") {
        const { data, error } = await createClient().auth.mfa.enroll({
          factorType: "totp",
          friendlyName: store.state.options.name.trim(),
        });
        if (error) {
          toast.error(`Unexpected Error: ${error.message}`);
          return { canContinue: false, error: error.message };
        }
        store.replace("totp", {
          factorId: data.id,
          qrCode: data.totp.qr_code,
          value: "",
        });
      }

      return { canContinue: true };
    },
  },
  {
    title: "Enroll",
    icon: ComputerIcon,
    component: (store) => {

      const router = useRouter();

      useEffect(() => {

        const supabase = createClient();

        // do webauthn
        if (store.state.options.type === "webauthn") {
          const origin = new URL(`${process.env.NODE_ENV === "development" ? "http" : "https"}://${window.env.HOSTNAME}${process.env.NODE_ENV === "development" ? ":3030" : ""}`);
          supabase.auth.mfa.webauthn.register({
            friendlyName: store.state.options.name,
            rpId: window.env.HOSTNAME,
            rpOrigins: [ origin.toString().replace(/\/$/, "") ]
          }).then(async ({ error }) => {
            if (error) {
              toast.error(`Unexpected Error: ${error.message}`);
              return;
            }

            const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            if (data?.currentLevel !== "aal2") router.push("/auth/mfa/verify");
            else router.push("/dashboard");
          });
        }

      }, []);

      switch (store.state.options.type) {
        case "totp":
          return (
            <div className={"flex flex-col items-center justify-center"}>

              <H4>{"Scan QR Code"}</H4>
              <P className={"text-muted-foreground w-1/2 text-center mb-2"}>
                {"Scan the QR Code below in your authenticator app. Press the Next button when you're ready to continue."}
              </P>

              {store.state.totp.qrCode ? (
                <img alt={"QR Code"} className={"w-[200px] h-[200px]"} src={store.state.totp.qrCode}/>
              ) : (
                <Skeleton className={"w-[200px] h-[200px]"}/>
              )}
            </div>
          );

        case "webauthn":
          return (
            <Spinner className={"w-[75px] h-[75px] m-[50px]"}/>
          );

        default:
          return null;
      }
    }
  },
  {
    title: "Verify",
    icon: ShieldCheckIcon,
    component: (store) => {
      return (
        <div className={"w-full flex flex-col items-center justify-center mb-4 gap-8"}>

          <div className={"w-full flex flex-col items-center justify-center"}>
            <H4>{"Enter Code"}</H4>
            <P
              className={"text-center w-1/2"}>{"Enter the 6-digit code from your authenticator application below to continue."}</P>
          </div>

          <InputOTP
            value={store.state.totp.value}
            onChange={(value) => store.set("totp", "value", value)}
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
        </div>
      );
    },
    beforeNext: async (store, router) => {

      const supabase = createClient();

      const resp = await supabase.auth.mfa.challengeAndVerify({
        factorId: store.state.totp.factorId!,
        code: store.state.totp.value!
      });

      if (resp.error) return {
        canContinue: false,
        error: resp.error.message
      };

      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (data?.currentLevel !== "aal2") router.push("/auth/mfa/verify");
      else router.push("/dashboard");

      return { canContinue: true };
    }
  }
];