"use client"

import { Slider } from "@/components/ui/slider"
import { Clock } from "lucide-react"
import { usePlaylist } from "@/context/playlist-context"
import { useTranslation } from "@/lib/i18n"

export default function DurationSlider() {
  const { t } = useTranslation()
  const { duration, setDuration } = usePlaylist()

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t("minutes")}`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours} ${t("hour")} ${mins} ${t("minutes")}` : `${hours} ${t("hour")}`
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("playlistDuration")}</label>
        <div className="flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Clock className="h-4 w-4 mr-1 text-zinc-500" />
          {formatDuration(duration)}
        </div>
      </div>

      <Slider
        value={[duration]}
        min={15}
        max={120}
        step={5}
        onValueChange={(value) => setDuration(value[0])}
        className="py-2"
      />

      <div className="flex justify-between text-xs text-zinc-500">
        <span>15 min</span>
        <span>120 min</span>
      </div>
    </div>
  )
}
