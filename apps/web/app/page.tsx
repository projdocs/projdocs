import Hero from "@workspace/ui/components/hero";
import * as process from "node:process";
import { redirect } from "next/navigation";



export default function Page() {

  if (process.env.MODE !== "standalone") return redirect("/dashboard");

  return (
    <div className={"bg-background h-screen w-screen overflow-scroll"}>
      <Hero/>
    </div>
  );
}
