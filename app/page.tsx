"use client"

import { Suspense } from "react"
import MoodSelector from "@/components/mood-selector"
import DurationSlider from "@/components/duration-slider"
import Filters from "@/components/filters"
import GenerateButton from "@/components/generate-button"
import PlaylistDisplay from "@/components/playlist-display"
import MusicPlayer from "@/components/music-player"
import AuthButtons from "@/components/auth-buttons"
import ConnectedAccounts from "@/components/connected-accounts"
import { Loader2 } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export default function Home() {
  const { t } = useTranslation()

  return (
    <main>
      <div className="container mx-auto px-4 py-4">
        {/* Top row with three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Mood & Filters */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">{t("moodAndFilters")}</h2>
            <div className="space-y-6">
              <MoodSelector />
              <DurationSlider />
              <Filters />
              <GenerateButton />
            </div>
          </div>

          {/* Connect Your Accounts */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">{t("connectAccounts")}</h2>
            <AuthButtons />
          </div>

          {/* Connected Accounts */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700">
            <ConnectedAccounts />
          </div>
        </div>

        {/* Bottom row with two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Your Playlist */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">{t("yourPlaylist")}</h2>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
              }
            >
              <PlaylistDisplay />
            </Suspense>
          </div>

          {/* Music Player */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">{t("musicPlayer")}</h2>
            <MusicPlayer />
          </div>
        </div>
      </div>
    </main>
  )
}
