import { ReactNode } from "react";
import { StarfieldBackground } from "@packages/ui/backgrounds/stars";



export default function ({children}: {
  children: ReactNode;
}) {
  return (
    <div className={"flex h-dvh w-dvw flex-col items-center justify-center bg-muted"}>
      <StarfieldBackground>
        {children}
      </StarfieldBackground>
    </div>
  )
}