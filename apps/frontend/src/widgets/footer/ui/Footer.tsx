import Link from 'next/link'
import { Lock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-0 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-lg text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>© {new Date().getFullYear()} Evently</span>
          <Link href="/login" className="text-muted-foreground hover:text-black transition-colors">
            <Lock className="size-4" />
          </Link>
        </div>
        <nav className="flex flex-wrap items-center gap-6">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Политика конфиденциальности
          </Link>
          <Link href="/personal-data" className="hover:text-foreground transition-colors">
            Обработка персональных данных
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Пользовательское соглашение
          </Link>
        </nav>
      </div>
    </footer>
  )
}
