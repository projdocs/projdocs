import { Geist, Geist_Mono } from "next/font/google";
import "./index.css";
import { ThemeProvider } from "@workspace/ui/components/theme-provider";
import { Toaster } from "@workspace/ui/components/sonner";
import { ReactNode } from "react";
import EnvProvider from "@workspace/web/components/env-provider";



const fontSans = Geist({
  subsets: [ "latin" ],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: [ "latin" ],
  variable: "--font-mono",
});

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <head title={"ProjDocs"}>
      <meta name={"description"} content={"A project-oriented document management system!"}/>
      <script src="/env.js"/>
    </head>
    <body
      className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
    >
    <Toaster/>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <EnvProvider>
        {children}
      </EnvProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
