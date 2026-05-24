"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@packages/ui/components/card";
import Logo from "@packages/ui/branding/logo/logo";
import { Button } from "@packages/ui/components/button";
import { Input } from "@packages/ui/components/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@packages/ui/components/field";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@packages/ui/components/tooltip";
import { supabase } from "@apps/admin/lib/subase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";



const schema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "admin@projdocs.localhost",
      password: process.env.NODE_ENV === "development" ? "c3bcc25f-c585-4a09-8730-6d62fae27657" : "",
    },
  });

  async function onSubmit({ email, password }: FormValues) {
    const id = toast.loading("Signing in...");
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) toast.error("Unable to sign in!", { id, description: error.message });
    else {
      toast.success("Signed in successfully", { id, description: "Welcome back!" });
      router.push("/")
      await new Promise((r) => {});
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className={"flex flex-col gap-2 w-full"}>
          <div className="w-full flex flex-row items-center justify-center">
            <Logo className="w-1/2" />
          </div>
          <CardTitle className="w-full text-center text-2xl text-muted-foreground">
            {"Admin Portal"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <TooltipProvider>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">{"Username"}</FieldLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          disabled
                          readOnly
                          className="w-full"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {"Adding administrators is coming soon."}
                    </TooltipContent>
                  </Tooltip>
                  {errors.email && (
                    <FieldError errors={[ errors.email ]} />
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">{"Password"}</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  {errors.password && (
                    <FieldError errors={[ errors.password ]} />
                  )}
                </Field>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>
              </FieldGroup>
            </form>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}