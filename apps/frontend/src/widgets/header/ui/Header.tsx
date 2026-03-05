import { auth } from "@/auth"
import Link from "next/link"
import { cn } from "@/shared/lib/utils"
import { UserNav } from "./UserNav"

interface HeaderProps {
  className?: string
  leftSlot?: React.ReactNode
  showLogo?: boolean
}

export async function Header({ className, leftSlot, showLogo = true }: HeaderProps) {
  const session = await auth()

  return (
    <header className={cn("border-b bg-background px-8", className ?? "fixed top-0 left-0 right-0 z-50")}>
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {leftSlot}
          {showLogo && (
            <Link href="/" className="text-4xl font-semibold">
              EVENTLY
            </Link>
          )}
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-lg hover:text-foreground/70 transition-colors">
            Локации
          </Link>
        </nav>
        <UserNav session={session} />
      </div>
    </header>
  )
}
