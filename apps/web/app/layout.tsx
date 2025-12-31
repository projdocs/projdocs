import { Geist, Geist_Mono } from "next/font/google";
import "./index.css";
import { ThemeProvider } from "@workspace/ui/components/theme-provider";
import { Toaster } from "@workspace/ui/components/sonner";
import { ReactNode } from "react";
import * as process from "node:process";
import { AuthProvider } from "@workspace/web/components/auth-provider";
import { BrowserRuntimeEnvironment } from "@workspace/web/types/env";



const fontSans = Geist({
  subsets: [ "latin" ],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: [ "latin" ],
  variable: "--font-mono",
});

function getWindowEnv(): BrowserRuntimeEnvironment {
  return {
    MODE: process.env.MODE,
    SUPABASE_PUBLIC_URL: process.env.SUPABASE_PUBLIC_URL,
    SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY,
    HOSTNAME: process.env.HOSTNAME,
  }
}

export default function RootLayout({ children, }: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <head title={"ProjDocs"}>
      <meta name={"description"} content={"A project-oriented document management system!"}/>
    </head>
    <body
      className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
    >
    <script>{`window.env = ${JSON.stringify(getWindowEnv())};`}</script>
    <Toaster/>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}