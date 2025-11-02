import React, { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Spinner } from "@workspace/ui/components/spinner";
import { H4 } from "@workspace/ui/components/text";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@workspace/ui/components/form";
import { AuthStatus, useAuthStore } from "@workspace/desktop/src/lib/auth/store";

// --- Zod Schema ---
const LoginSchema = z.object({
  serverURL: z
    .string()
    .regex(
      /^(?:localhost(?::\d{1,5})?|127(?:\.\d{1,3}){3}(?::\d{1,5})?|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/,
      "Server URL must be a valid host (no protocol or path)"
    ),
});

type LoginSchemaType = z.infer<typeof LoginSchema>;


export const Login = ({ children }: {
  children: ReactNode
}) => {

  const auth = useAuthStore();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { serverURL: process.env.NODE_ENV === "development" ? "127.0.0.1:3030" : "" },
  });

  const onSubmit = async (values: LoginSchemaType) => {

    const url = new URL(`protocol://${values.serverURL}`);

    // fix protocol
    console.log(url);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      url.protocol = "http";
    } else {
      url.protocol = "https";
    }

    // fix url
    url.pathname = `/auth/login`;
    url.searchParams.set("redirect-type", "desktop");
    url.searchParams.set("redirect-to", "/v1/auth/callback");

    // start flow
    await window.app.open(url.toString());
    await window.app.hide();
  };

  switch (auth.state.state) {
    case AuthStatus.LOGGED_IN:
      return (children);
    case AuthStatus.LOADING:
      return (
        <div className="p-4 flex flex-col items-center justify-center">
          <Spinner className="size-8 text-secondary"/>
        </div>
      );
    case AuthStatus.LOGGED_OUT:
      return (
        <div className="p-4 flex flex-col items-center justify-center h-full w-full max-w-sm gap-14">

          <div className={"flex flex-col items-center justify-center gap-14 w-full"}>
            <img
              src={"ProjDocs-Logo.png"}
              alt="Example"
              className="rounded-xl shadow-md h-14 w-full object-cover"
            />

            <H4>{"Sign In to Continue"}</H4>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 w-full"
            >
              <FormField
                control={form.control}
                name="serverURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Server URL</FormLabel>
                    <FormControl>
                      <Input placeholder="api.projdocs.com" {...field} />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Log In
              </Button>
            </form>
          </Form>
        </div>
      );
  }
};