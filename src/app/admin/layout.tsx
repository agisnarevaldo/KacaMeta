"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  // Show sidebar for all other admin pages
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
