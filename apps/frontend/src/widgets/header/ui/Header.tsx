import { auth } from "@/auth"
import Link from "next/link"
import { cn } from "@/shared/lib/utils"
import { UserNav } from "./UserNav"

interface HeaderProps {
  className?: string
  leftSlot?: React.ReactNode
  showLogo?: boolean
  fullWidth?: boolean
}

export async function Header({ className, leftSlot, showLogo = true, fullWidth }: HeaderProps) {
  const session = await auth()

  return (
    <header className={cn("border-b bg-background px-8", className ?? "fixed top-0 left-0 right-0 z-50")}>
      <div className={cn("flex h-16 items-center justify-between", fullWidth ? "w-full" : "container mx-auto")}>
        <div className="flex items-center gap-2">
          {leftSlot}
          {showLogo && (
            <Link href="/" className="text-4xl font-semibold">
              EVENTLY
            </Link>
          )}
        </div>
        <UserNav session={session} />
      </div>
    </header>
  )
}
