import { auth } from "@/auth"
import Link from "next/link"
import { UserNav } from "./UserNav"

export async function Header() {
  const session = await auth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background px-8">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="text-4xl font-semibold">
          EVENTLY
        </Link>
        <UserNav session={session} />
      </div>
    </header>
  )
}
