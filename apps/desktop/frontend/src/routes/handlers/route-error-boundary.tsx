import { useRevalidator, useRouteError } from "react-router-dom";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { H3 } from "@packages/ui/components/typography";
import { Button } from "@packages/ui/components/button";



export function RootErrorBoundary() {
  let error = useRouteError();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const [ isRetrying, setIsRetrying ] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    revalidator.revalidate().then(() => navigate(0));
  };

  useEffect(() => {
    console.error(error);
  }, []);

  return (
    <div className={"w-full h-full flex flex-col items-center justify-center"}>
      <H3>{"Well, that was unexpected!"}</H3>
      <p>{"An unhandled error occurred."}</p>
      <div className={"flex flex-row gap-2 justify-center items-center pt-2"}>
        <Button disabled={isRetrying} className={"w-20"} onClick={handleRetry}>{"Retry"}</Button>
        <Button disabled={isRetrying} variant={"outline"} className={"w-20"}
                onClick={() => window.location.replace("/")}>{"Restart"}</Button>
      </div>
    </div>
  );
}