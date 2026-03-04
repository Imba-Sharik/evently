"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, ClipboardList, DollarSign } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

const navItems = [
  { href: "/admin/locations/new", label: "Добавить локацию", icon: PlusCircle },
  { href: "/admin/bookings", label: "Заявки", icon: ClipboardList },
  { href: "/admin/finances", label: "Финансы", icon: DollarSign },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="px-2 py-2">
          <span className="text-2xl font-bold">Evently</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl">Управление</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} className="text-xl py-5">
                    <Link href={item.href}>
                      <item.icon className="size-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
