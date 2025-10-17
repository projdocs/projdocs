import { H4 } from "@workspace/ui/components/text";
import { Button } from "@workspace/ui/components/button";
import React from "react";



export const Main = () => {
  return (
    <div className="p-4 flex flex-col items-center justify-between w-full h-full">
      <H4>{"Welcome Back!"}</H4>
      <Button
        variant="destructive"
        className="mt-4"
        onClick={async () => await window.secrets.delete()}
      >
        {"Log out"}
      </Button>
    </div>
  );
}