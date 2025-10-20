import { ThemeProvider } from "@workspace/desktop/src/theme/theme-provider";
import React, { CSSProperties } from "react";
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar";
import { SiteHeader } from "@workspace/ui/components/site-header";
import { AppSidebar } from "@workspace/word/components/sidebar";
import { Routes } from "@workspace/word/surfaces/folder-picker/router/routes";



const App = () => (
  <div className="fixed inset-0 flex flex-col font-sans antialiased bg-background overflow-hidden">
    <ThemeProvider>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties}
      >
        <AppSidebar variant="inset"/>
        <SidebarInset className="m-0 rounded-xl shadow-sm h-full overflow-hidden">
          <div className="flex h-full flex-col">
            <SiteHeader/>
            <div className="flex flex-1 flex-col overflow-hidden min-h-0">
              <Routes/>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  </div>
);

export default App;