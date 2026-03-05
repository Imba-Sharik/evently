"use client"

import { usePathname, useSearchParams } from "next/navigation"

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

export function PageTitle() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (TITLES[pathname]) {
    return <span className="text-xl font-semibold">{TITLES[pathname]}</span>
  }

  if (/^\/admin\/locations\/[^/]+\/events$/.test(pathname)) {
    const name = searchParams.get("name")
    const title = name ? `${name} / Мероприятия` : "Мероприятия"
    return <span className="text-xl font-semibold">{title}</span>
  }

  return null
}
