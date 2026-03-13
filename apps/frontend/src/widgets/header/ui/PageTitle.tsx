"use client"

import { usePathname } from "next/navigation"

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

  if (TITLES[pathname]) {
    return <span className="text-xl font-semibold">{TITLES[pathname]}</span>
  }

  if (/^\/admin\/events\/new$/.test(pathname)) {
    return <span className="text-xl font-semibold">Новое мероприятие</span>
  }

  if (/^\/admin\/events\/[^/]+\/edit$/.test(pathname)) {
    return <span className="text-xl font-semibold">Редактирование мероприятия</span>
  }

  return null
}
