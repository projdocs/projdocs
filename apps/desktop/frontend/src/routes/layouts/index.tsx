import { ThemeProvider } from "@apps/desktop/components/theme-provider";
import { Toaster } from "@packages/ui/components/sonner";
import { TooltipProvider } from "@packages/ui/components/tooltip";
import { Outlet } from "react-router-dom";
import { JSX, useEffect } from "react";
import { Events } from "@wailsio/runtime";
import { useNavigate } from "react-router";


export default function RootLayout(): JSX.Element {

  const navigate = useNavigate();
  useEffect(() => Events.On("projdocs:window:redirect", (event) => {
    const redirectURI: string = event.data;
    const url = new URL(redirectURI);
    navigate({
      pathname: url.pathname,
      search: url.search,
    });
  }), []);

  return (
    <div className={"bg-background h-dvh w-dvw flex flex-col overflow-hidden overscroll-none"}>
      <ThemeProvider>
        <Toaster />
        <TooltipProvider>
          <Outlet />
        </TooltipProvider>
      </ThemeProvider>
    </div>
  );
}