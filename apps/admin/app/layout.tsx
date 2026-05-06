import { Geist_Mono, Inter } from "next/font/google";

import "@packages/ui/globals.css";
import { ThemeProvider } from "@apps/admin/components/theme-provider";
import { cn } from "@packages/ui/lib/utils";
import { TooltipProvider } from "@packages/ui/components/tooltip";
import { Toaster } from "@packages/ui/components/sonner";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function ({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className={"h-dvh w-dvw"}>
        <ThemeProvider>
          <Toaster />
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
