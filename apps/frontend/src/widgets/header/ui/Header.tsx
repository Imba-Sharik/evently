import { auth } from "@/auth"
import Link from "next/link"
import { UserNav } from "./UserNav"

export async function Header() {
  const session = await auth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold">
          Logo
        </Link>
        <UserNav session={session} />
      </div>
    </header>
  )
}
