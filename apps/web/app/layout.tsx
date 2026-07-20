import { Geist_Mono, Inter } from "next/font/google";

import "@packages/ui/globals.css";
import { ThemeProvider } from "@apps/web/components/theme-provider";
import { cn } from "@packages/ui/lib/utils";
import { TooltipProvider } from "@packages/ui/components/tooltip";
import { LayoutProps } from "@apps/web/lib/types/layout";
import { Toaster } from "@packages/ui/components/sonner";
import Script from "next/script";
import { Environment } from "@apps/web/lib/types/runtime-env";



const inter = Inter({ subsets: [ "latin" ], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: [ "latin" ],
  variable: "--font-mono",
});

export default function({ children }: LayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
    <body className={"w-dvw h-dvh"}>
    <Script id="window-config" strategy="beforeInteractive">
      {`window.projdocs = ${JSON.stringify({
        NODE_ENV: process.env.NODE_ENV,
        PROJDOCS_API_URL: process.env.PROJDOCS_API_URL,
      } satisfies Environment)};`}
    </Script>
    <ThemeProvider>
      <Toaster />
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
