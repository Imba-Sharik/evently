import Image from "next/image"

import { LoginForm } from "@/features/auth/ui/LoginForm"

export default function LoginPage() {
  return (
    <div className="grid h-full lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/placeholder.svg"
          alt="Login background"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <Image src="/EVENTLY-dark.svg" alt="Evently" width={130} height={22} />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
