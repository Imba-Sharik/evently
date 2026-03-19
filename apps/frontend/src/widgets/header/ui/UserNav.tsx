"use client"

import { signOut } from "next-auth/react"
import type { Session } from "next-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"


interface UserNavProps {
  session: Session | null
}

export function UserNav({ session }: UserNavProps) {
  if (!session) {
    return null
  }

  const initials = session.user?.name?.charAt(0).toUpperCase() ?? "U"

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-9 w-9 cursor-pointer ring-1 ring-black">
          <AvatarImage
            src={session.user?.image ?? ""}
            alt={session.user?.name ?? "User"}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 text-lg">
        <div className="px-2 py-1.5">
          <p className="text-lg font-medium">{session.user?.name}</p>
          <p className="text-lg text-muted-foreground">{session.user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
