import { ThemeProvider } from "@workspace/desktop/src/theme/theme-provider";
import React, { useEffect } from "react";
import { H2, H4, P } from "@workspace/ui/components/text";
import { Button } from "@workspace/ui/components/button";



const App = () => {

  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");
  const description = params.get("desc");

  return (
    <div className="fixed inset-0 flex flex-col font-sans antialiased bg-background overflow-hidden">
      <ThemeProvider>
        <div className={"flex flex-col w-full h-full items-center p-4 justify-center"}>
          <H4 className={"text-center"}>{title}</H4>
          <P className={"text-center"}>{description}</P>
          <Button
            size={"sm"}
            className={"mt-4"}
            onClick={() => Office.context.ui.messageParent("close")}
          >
            {"Close"}
          </Button>
        </div>
      </ThemeProvider>
    </div>
  );

}

export default App;