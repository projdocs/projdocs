import { Geist_Mono, Inter } from "next/font/google";

import "@packages/ui/globals.css";
import { ThemeProvider } from "@apps/web/components/theme-provider";
import { cn } from "@packages/ui/lib/utils";
import { TooltipProvider } from "@packages/ui/components/tooltip";
import { LayoutProps } from "@apps/web/lib/types/layout";
import { Toaster } from "@packages/ui/components/sonner";



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
    <ThemeProvider>
      <Toaster />
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
