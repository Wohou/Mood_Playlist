import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { PlaylistProvider } from "@/context/playlist-context"
import { I18nProvider } from "@/components/i18n-provider"
import { AuthProvider } from "@/context/auth-context"
import { PlayerProvider } from "@/context/player-context"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MoodPlaylist - Generate AI Music Playlists",
  description: "Generate personalized music playlists based on your mood using AI",
    generator: 'dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <I18nProvider>
            <AuthProvider>
              <PlaylistProvider>
                <PlayerProvider>
                  <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
                    <Header />
                    {children}
                    <Toaster />
                  </div>
                </PlayerProvider>
              </PlaylistProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
