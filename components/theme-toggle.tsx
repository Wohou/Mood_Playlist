"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle theme toggle with explicit logging
  const toggleTheme = () => {
    console.log("Toggle theme clicked. Current theme:", resolvedTheme)
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    console.log("Setting new theme to:", newTheme)
    setTheme(newTheme)
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="w-9 h-9" /> // Placeholder with same dimensions
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-9 h-9 border-zinc-200 dark:border-zinc-700"
      aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-300" />
      ) : (
        <Moon className="h-5 w-5 text-zinc-700" />
      )}
    </Button>
  )
}
