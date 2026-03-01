import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={className}>
        <div className="absolute left-6 top-8 z-30 lg:hidden">
          <SidebarTrigger className="bg-slate-900 border border-slate-800 text-blue-500 hover:text-blue-400" />
        </div>
        <div className="relative min-h-screen bg-slate-950 overflow-x-hidden">
          {/* Futuristic grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />
          <div className="absolute inset-0 bg-radial-gradient from-blue-900/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            {container ? (
              <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>
                {children}
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}