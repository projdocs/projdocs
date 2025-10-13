"use client";

import { cn } from "@workspace/ui/lib/utils";
import { createClient } from "@workspace/web/lib/supabase/client";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentPropsWithoutRef, FormEvent, useState } from "react";
import { _request, _sessionResponsePassword } from "@supabase/auth-js/src/lib/fetch";



export function LoginForm({ className, ...props }: ComponentPropsWithoutRef<"div">) {

  const [ email, setEmail ] = useState(process.env.NODE_ENV === "development" ? "harvey@pearsonspecter.com" : "");
  const [ password, setPassword ] = useState(process.env.NODE_ENV === "development" ? "password123" : "");
  const [ error, setError ] = useState<string | null>(null);
  const [ isLoading, setIsLoading ] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // handle different return types
    const query = new URLSearchParams(window.location.search);
    const redirectType = query.get("redirect-type") ?? "web";
    try {
      switch (redirectType) {
        case "desktop":

          const base = window.env.SUPABASE_PUBLIC_URL;
          const anonKey = window.env.SUPABASE_PUBLIC_KEY;
          if (!base || !anonKey) {
            throw new Error("Supabase environment variables not found in window.env");
          }

          // do login request manually, to avoid persistence
          const res = await fetch(`${base}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${anonKey}`,
              "apikey": anonKey,
            },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          if (res.status === 200) {
            const data = await res.json();

            const user = data.user;
            const session = data;
            delete session.user;

            const path = query.get("redirect-to");
            if(path === null) throw new Error("Redirect query param is missing!");

            const url = new URL("projdocs://");
            url.pathname = path;
            url.searchParams.set("user", JSON.stringify(user));
            url.searchParams.set("session", JSON.stringify(session));
            console.log(url.toString());

            open(url.toString());
            router.push("/")
            // setTimeout(() => router.push("/"), 5000);
          } else {
            throw new Error(res.statusText);
          }
          break;
        case "web":
          // get login and persist it
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          // Update this route to redirect to an authenticated route. The user already has an active session.
          router.push("/dashboard");
          break;
        default:
          throw new Error(`Rediect Type "${query.get("redirect-type")}" is unhandled!`);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
