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
      setPasswordError("Пароли не совпадают")
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
          <h1 className="text-2xl font-bold">Создать аккаунт</h1>
          <p className="text-muted-foreground text-lg text-balance">
            Заполните форму для создания аккаунта
          </p>
        </div>
        <Field>
          <FieldLabel className="text-lg" htmlFor="username">Имя пользователя</FieldLabel>
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
          <FieldLabel className="text-lg" htmlFor="email">Почта</FieldLabel>
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
          <FieldLabel className="text-lg" htmlFor="password">Пароль</FieldLabel>
          <PasswordInput id="password" name="password" autoComplete="new-password" className="text-lg h-11" required />
          <FieldDescription className="text-lg">Минимум 8 символов.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel className="text-lg" htmlFor="confirmPassword">Подтвердите пароль</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            className="text-lg h-11"
            required
          />
          <FieldDescription className="text-lg">Повторите пароль выше.</FieldDescription>
        </Field>
        <Field>
          {(passwordError ?? state?.error) && (
            <FieldError>{passwordError ?? state?.error}</FieldError>
          )}
          <Button type="submit" className="text-lg h-11" disabled={isPending}>
            {isPending ? "Регистрируем..." : "Зарегистрироваться"}
          </Button>
        </Field>
        <FieldDescription className="text-center text-lg">
          Уже есть аккаунт?{" "}
          <Link href="/login">Войти</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
