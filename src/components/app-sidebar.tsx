"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: "ph:house-bold",
      isActive: true,
      items: [],
    },
    {
      title: "Produk",
      url: "/admin/products",
      icon: "ph:package-bold",
      items: [],
    },
    {
      title: "Kategori",
      url: "/admin/categories",
      icon: "ph:tag-bold",
      items: [],
    },
    // {
    //   title: "Konsultasi",
    //   url: "/admin/consultations",
    //   icon: "ph:chat-circle-dots-bold",
    //   items: [],
    // },
    // {
    //   title: "Pesanan",
    //   url: "/admin/orders",
    //   icon: "ph:shopping-cart-bold",
    //   items: [],
    // },
  ],
  superAdminNav: [
    {
      title: "Kelola Admin",
      url: "/admin/manage-admins",
      icon: "ph:users-bold",
      items: [],
    },
    // {
    //   title: "Sistem",
    //   url: "/admin/system",
    //   icon: "ph:gear-bold", 
    //   items: [],
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b">
        <div className="flex items-center space-x-2 gap-2">
          <Icon icon="mdi:glasses" className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">KacaMeta</h2>
            {/* <p className="text-sm text-slate-500">Admin Dashboard</p> */}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url} className="flex items-center space-x-2">
                      <Icon icon={item.icon} className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Super Admin Menu */}
        {session?.user?.role === 'SUPER_ADMIN' && (
          <SidebarGroup>
            <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.superAdminNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url} className="flex items-center space-x-2">
                        <Icon icon={item.icon} className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {session?.user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">
                {(session?.user?.username?.[0]?.toUpperCase() || "") + (session?.user?.username?.slice(1) || "")}
              </p>
              <p className="text-xs text-slate-500">
                {session?.user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-700"
          >
            <Icon icon="ph:sign-out-bold" className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}