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
        onClick={async () => {
          const accounts = await window.auth.list();
          await Promise.all(accounts.map((a) => window.auth.deleteSecret(a.account)));
        }}
      >
        {"Log out"}
      </Button>
    </div>
  );
}