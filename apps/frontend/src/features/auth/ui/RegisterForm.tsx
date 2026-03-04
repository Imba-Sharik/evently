"use client"

import { useActionState, useState } from "react"
import Link from "next/link"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { PasswordInput } from "@/shared/ui/password-input"
import { registerAction } from "@/features/auth/model/actions"

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [state, formAction, isPending] = useActionState(registerAction, null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget)
    if (data.get("password") !== data.get("confirmPassword")) {
      e.preventDefault()
      setPasswordError("Passwords do not match")
    } else {
      setPasswordError(null)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      action={formAction}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-muted-foreground text-lg text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel className="text-lg" htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe"
            autoComplete="username"
            className="text-lg h-11"
            required
          />
        </Field>
        <Field>
          <FieldLabel className="text-lg" htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            className="text-lg h-11"
            required
          />
        </Field>
        <Field>
          <FieldLabel className="text-lg" htmlFor="password">Password</FieldLabel>
          <PasswordInput id="password" name="password" autoComplete="new-password" className="text-lg h-11" required />
          <FieldDescription className="text-lg">Minimum 8 characters.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel className="text-lg" htmlFor="confirmPassword">Confirm password</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            className="text-lg h-11"
            required
          />
          <FieldDescription className="text-lg">Repeat the password above.</FieldDescription>
        </Field>
        <Field>
          {(passwordError ?? state?.error) && (
            <FieldError>{passwordError ?? state?.error}</FieldError>
          )}
          <Button type="submit" className="text-lg h-11" disabled={isPending}>
            {isPending ? "Signing up..." : "Sign up"}
          </Button>
        </Field>
        <FieldDescription className="text-center text-lg">
          Already have an account?{" "}
          <Link href="/login">Log in</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
