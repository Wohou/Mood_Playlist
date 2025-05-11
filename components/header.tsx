"use client"

import { useTranslation } from "@/lib/i18n"
import ThemeToggle from "@/components/theme-toggle"
import LanguageSelector from "@/components/language-selector"

export default function Header() {
  const { t } = useTranslation()

  return (
    <header className="py-4 px-4 flex flex-col sm:flex-row items-center justify-between">
      <div className="flex flex-col items-center sm:items-start mb-2 sm:mb-0">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("appName")}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("appDescription")}</p>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
    </header>
  )
}
