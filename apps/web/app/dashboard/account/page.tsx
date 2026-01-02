"use client";
import { useAppStore } from "@workspace/web/store";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { H1, H2, H3, H4, P } from "@workspace/ui/components/text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { createClient } from "@workspace/supabase/client";
import { toast } from "sonner";
import { AuthMFAListFactorsResponse } from "@supabase/supabase-js";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { KeyRoundIcon, LucideIcon, MessageSquareMoreIcon, QrCodeIcon, TrashIcon } from "lucide-react";
import { DateTime } from "luxon";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";



const getFactorDisplay = (factor: NonNullable<AuthMFAListFactorsResponse["data"]>["all"][number]): string => {
  switch (factor.factor_type) {
    case "webauthn":
      return "Security Key";
    case "totp":
      return "Time-Sensitive Authenticator";
    case "phone":
      return "Time-Sensitive SMS Messages";
  }
};

const FactorIcon = (factor: NonNullable<AuthMFAListFactorsResponse["data"]>["all"][number]): ReactNode => {
  const Icon = useMemo<LucideIcon>(() => {
    switch (factor.factor_type) {
      case "webauthn":
        return KeyRoundIcon;
      case "totp":
        return QrCodeIcon;
      case "phone":
        return MessageSquareMoreIcon;
    }
  }, [ factor.factor_type ]);

  return <Icon className={"w-[75px] h-[75px]"}/>;
};

const MFASection = () => {

  const listFactors = () => {
    const supabase = createClient();
    supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (error) {
        toast.error("Unable to List MFA Factors!", { description: error.message });
        console.error(error);
      }
      setFactors(data);
    });
  };

  const [ factors, setFactors ] = useState<AuthMFAListFactorsResponse["data"]>();
  const router = useRouter();
  useEffect(listFactors, []);

  return (
    <div className={"flex flex-col gap-2"}>
      <div className={"flex flex-row items-center w-full justify-between"}>
        <H4>{"Multi-Factor Authentication (MFA)"}</H4>
        <Button
          variant={"ghost"}
          onClick={() => router.push("/auth/mfa/enroll")}
        >
          {"Add Method"}
        </Button>
      </div>


      {factors === undefined ? (
        <Skeleton className={"w-full h-[125px]"}/>
      ) : (factors !== null && (
        factors.all.map((factor, _, factors) => (
          <Card key={factor.id} className={"w-full max-w-full overflow-hidden"}>
            <CardHeader className={"flex flex-row gap-6 items-center w-full max-w-full overflow-hidden"}>
              <FactorIcon {...factor} />
              <div className={"flex flex-col gap-1 w-full max-w-full overflow-hidden"}>
                <CardTitle className={"truncate"}>{factor.friendly_name}</CardTitle>
                <CardDescription
                  className={"truncate"}>{getFactorDisplay(factor)}{` · Added ${DateTime.fromISO(factor.created_at).toRelative()}`}</CardDescription>
                <Badge variant={factor.status === "unverified" ? "destructive" : undefined}>
                  {factor.status.toUpperCase()}
                </Badge>
              </div>
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => factors.length <= 1 ? toast.error("At least one factor is required!", { description: "Add a second authentication factor to remove this one." }) : createClient().auth.mfa.unenroll({ factorId: factor.id }).then(({ error }) => {
                  if (error) {
                    toast.error("Unable to remove factor!", { description: error.message });
                  } else {
                    listFactors();
                  }
                })}
              >
                <TrashIcon/>
              </Button>
            </CardHeader>
          </Card>
        ))
      ))}

    </div>
  );

};

export default function Page() {

  const store = useAppStore();
  if (!store.state.auth.user) return null;

  return (
    <div className={"flex flex-col p-4 w-full gap-4"}>

      <div className={"flex flex-row w-full"}>

        {/* LEFT COLUMN */}
        <div className="w-1/3 lg:w-1/4">
          <div className="w-full max-w-full overflow-hidden p-4">
            <Card className="w-full max-w-full overflow-hidden">
              {/* items-stretch gives children width pressure */}
              <CardContent className="flex w-full max-w-full flex-col items-stretch justify-center overflow-hidden">
                {/* center only the avatar */}
                <div className="flex justify-center">
                  <Avatar className="mb-2 h-[100px] w-[100px] shrink-0">
                    <AvatarImage
                      alt={"avatar"}
                      src={store.state.auth.user.avatar_url ?? undefined}
                    />
                    <AvatarFallback className={"text-4xl"}>
                      {store.state.auth.user.first_name[0]!.toUpperCase()}
                      {store.state.auth.user.last_name[0]!.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <H2 className="w-full min-w-0 truncate text-center">
                  {store.state.auth.user.first_name}
                </H2>

                <H4 className="w-full min-w-0 truncate text-center">
                  {store.state.auth.user.last_name}
                </H4>

                <P className="w-full min-w-0 truncate text-center">
                  {store.state.auth.meta.email}
                </P>

                <div className={"mt-2 flex flex-row items-center justify-center w-full overflow-hidden gap-2"}>
                  { store.state.auth.isAdmin ? (
                    <Badge variant={"secondary"}>{"Admin"}</Badge>
                  ) : (
                    <Badge variant={"outline"}>{"User"}</Badge>
                  ) }
                </div>

                <P className="mt-8 text-xs w-full min-w-0 truncate text-center text-muted-foreground">
                  {store.state.auth.user.id}
                </P>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT/MAIN COLUMN */}
        <div className={"w-2/3 lg:w-3/4"}>
          <div className={"w-full flex flex-col p-4 gap-6"}>

            <div className={"flex flex-col"}>
              <H1>{"Account Settings"}</H1>
              <P className={"text-muted-foreground"}>
                {"Manage settings and preferences related to your account. Some settings, such as your name or email address, are controlled by your organization's administrator."}
              </P>
            </div>

            <div className={"flex flex-col gap-2"}>
              <H2>{"Authentication & Security"}</H2>

              <MFASection/>

            </div>


          </div>
        </div>

      </div>
    </div>
  );

}