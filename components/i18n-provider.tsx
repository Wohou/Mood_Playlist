"use client"

import { useState, useEffect, type ReactNode } from "react"
import { I18nContext, translations } from "@/lib/i18n"

type I18nProviderProps = {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  // Default to English, but try to get from localStorage on client
  const [language, setLanguageState] = useState("en")
  const [forceUpdate, setForceUpdate] = useState(0)

  useEffect(() => {
    // Get language from localStorage on client
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguageState(lang)
      localStorage.setItem("language", lang)
      // Force a re-render of all components using translations
      setForceUpdate((prev) => prev + 1)
    }
  }

  // Translation function
  const t = (key: string, params?: Record<string, string | number>) => {
    const translation = translations[language]?.[key] || key

    if (params) {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(new RegExp(`{${paramKey}}`, "g"), String(paramValue))
      }, translation)
    }

    return translation
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, _forceUpdate: forceUpdate }}>
      {children}
    </I18nContext.Provider>
  )
}
