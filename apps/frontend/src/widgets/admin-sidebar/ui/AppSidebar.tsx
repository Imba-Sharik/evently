"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, CalendarDays, ClipboardList, DollarSign, Users } from "lucide-react";
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

const groups = [
  {
    label: "Контент",
    items: [
      { href: "/admin/locations", label: "Локации", icon: MapPin },
      { href: "/admin/events", label: "Мероприятия", icon: CalendarDays },
    ],
  },
  {
    label: "Операции",
    items: [
      { href: "/admin/bookings", label: "Заявки", icon: ClipboardList },
      { href: "/admin/team", label: "Команда", icon: Users },
    ],
  },
  {
    label: "Аналитика",
    items: [
      { href: "/admin/finances", label: "Финансы", icon: DollarSign },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="px-2 py-2">
          <Link href="/" className="text-2xl font-bold">Evently</Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xl">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
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
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
