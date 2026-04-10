"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { DisplayableError } from "@/lib/types/displayable-error"
import { Button } from "@workspace/ui/components/button"
import { useRouter } from "next/navigation"



export default function({
                          error,
                          reset,
                        }: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  const router = useRouter();
  let displayable = DisplayableError.fromError(error);

  useEffect(() => {
    console.error(error)
  }, [ error ]);

  return (
    <div className={"flex h-dvh w-dvw flex-col items-center justify-center"}>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            {displayable
              ? displayable.Title()
              : "Unexpected Error"}
          </CardTitle>
          <CardDescription>
            {displayable
              ? displayable.Description()
              : "Check the browser's console-logs for more details"}
          </CardDescription>
          <CardAction></CardAction>
        </CardHeader>
        <CardFooter className="flex-col gap-2">
          <Button className={"w-full"} onClick={() => reset()}>
            {"Retry"}
          </Button>
          <Button
            variant={"ghost"}
            className={"w-full"}
            onClick={() => router.replace("/")}
          >
            {"Go to Homepage"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
