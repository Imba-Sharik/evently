import { auth } from "@/auth"
import Link from "next/link"
import { cn } from "@/shared/lib/utils"
import { UserNav } from "./UserNav"

interface HeaderProps {
  className?: string
  leftSlot?: React.ReactNode
}

export async function Header({ className, leftSlot }: HeaderProps) {
  const session = await auth()

  return (
    <header className={cn("border-b bg-background px-8", className ?? "fixed top-0 left-0 right-0 z-50")}>
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {leftSlot}
          <Link href="/" className="text-4xl font-semibold">
            EVENTLY
          </Link>
        </div>
        <UserNav session={session} />
      </div>
    </header>
  )
}
