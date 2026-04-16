"use client";

import { useRef, useState, useTransition } from "react";
import { loginAction } from "@apps/web/app/admin/auth/actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@packages/ui/components/dialog";
import { Info, LockKeyhole } from "lucide-react";
import { Label } from "@packages/ui/components/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@packages/ui/components/tooltip";
import { Input } from "@packages/ui/components/input";
import { Button } from "@packages/ui/components/button";


export default function LoginForm({isDev}: {
  isDev: boolean;
}) {

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="space-y-1 text-center items-center">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-2">
            <LockKeyhole className="h-6 w-6 text-primary" />
          </span>
          <DialogTitle className="text-2xl">Admin Login</DialogTitle>
          <DialogDescription>
            Enter your API key to access the admin panel.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username field */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="username">Username</Label>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[200px]">
                      Dynamic admin users are a work in progress. Only the
                      built-in `admin` account is available right
                      now.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="username"
                name="username"
                value="admin"
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>

            {/* API Key field */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                placeholder="pak-••••••••••••••••"
                autoComplete="current-password"
                required
                disabled={isPending}
                defaultValue={isDev ? "pak-00000000-0000-0000-0000-000000000000" : ""}
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

