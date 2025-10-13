import React, { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";



export const RootLayout = ({ children }: {
  children: ReactNode
}) => (
  <div className="fixed inset-0 flex flex-col font-sans antialiased bg-background overflow-hidden">
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </div>
);