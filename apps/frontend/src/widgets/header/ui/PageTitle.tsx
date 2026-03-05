"use client"

import { usePathname } from "next/navigation"

const TITLES: Record<string, string> = {
  "/admin/locations": "Локации",
  "/admin/events": "Мероприятия",
  "/admin/bookings": "Заявки",
  "/admin/team": "Команда",
  "/admin/finances": "Финансы",
  "/profile": "Профиль",
}

export function PageTitle() {
  const pathname = usePathname()
  const title = TITLES[pathname] ?? ""
  return <span className="text-xl font-semibold">{title}</span>
}
