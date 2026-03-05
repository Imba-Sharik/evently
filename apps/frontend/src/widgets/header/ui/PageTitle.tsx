"use client"

import { usePathname } from "next/navigation"
import { locations } from "@/shared/mocks/locations"

const TITLES: Record<string, string> = {
  "/admin/locations": "Локации",
  "/admin/events": "Мероприятия",
  "/admin/bookings": "Заявки",
  "/admin/team": "Команда",
  "/admin/finances": "Финансы",
  "/admin/ai-assistant": "AI Ассистент",
  "/admin/chat": "Чат",
  "/profile": "Профиль",
}

function getTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname]
  const eventsMatch = pathname.match(/^\/admin\/locations\/(\d+)\/events$/)
  if (eventsMatch) {
    const location = locations.find((l) => l.id === Number(eventsMatch[1]))
    return location ? `${location.name} / Мероприятия` : "Мероприятия"
  }
  return ""
}

export function PageTitle() {
  const pathname = usePathname()
  return <span className="text-xl font-semibold">{getTitle(pathname)}</span>
}
