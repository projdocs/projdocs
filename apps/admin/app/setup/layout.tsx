import { ReactNode } from "react";
import { Card, CardContent } from "@packages/ui/components/card";



export default function({children}: {
  children: ReactNode;
}) {

  return (
    <div className={"w-full h-full flex flex-col items-center justify-center"}>
      {children}
    </div>
  )

}