"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, MapPin, CalendarDays, ClipboardList, DollarSign, Users, Bot, MessageSquare } from "lucide-react";
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
      { href: "/", label: "Главная", icon: Home },
      { href: "/admin/locations", label: "Локации", icon: MapPin },
      { href: "/admin/events", label: "Мероприятия", icon: CalendarDays },
    ],
  },
  {
    label: "Операции",
    items: [
      { href: "/admin/bookings", label: "Заявки", icon: ClipboardList },
      { href: "/admin/chat", label: "Чат", icon: MessageSquare },
      { href: "/admin/team", label: "Команда", icon: Users },
      { href: "/admin/finances", label: "Финансы", icon: DollarSign },
    ],
  },
];

const aiItem = { href: "/admin/ai-assistant", label: "AI Ассистент", icon: Bot };

const activeClass =
  "bg-primary! text-primary-foreground! font-semibold! hover:bg-primary/90! hover:text-primary-foreground!";

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const aiActive = isActive(aiItem.href);

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="px-2 py-2">
          <Link href="/"><Image src="/EVENTLY-dark.svg" alt="Evently" width={130} height={22} /></Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xl">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={`text-xl py-5 ${active ? activeClass : ""}`}
                      >
                        <Link href={item.href}>
                          <item.icon className="size-5 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={aiActive}
                  className={`text-xl py-5 ${aiActive ? activeClass : ""}`}
                >
                  <Link href={aiItem.href}>
                    <aiItem.icon className="size-5 shrink-0" />
                    <span>{aiItem.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
