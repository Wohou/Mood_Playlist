"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import { usePlaylist } from "@/context/playlist-context"
import { useTranslation } from "@/lib/i18n"

const genres = ["Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Jazz", "Classical", "Country", "Folk", "Indie"]

export default function Filters() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { bpmRange, setBpmRange, energyLevel, setEnergyLevel, selectedGenres, setSelectedGenres } = usePlaylist()

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
    } else {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  return (
    <div className="space-y-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100">
          {t("advancedFilters")}
          {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 pt-3">
          {/* BPM Range */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("bpmRange")}</label>
              <span className="text-sm text-zinc-500">
                {bpmRange[0]} - {bpmRange[1]} BPM
              </span>
            </div>
            <Slider
              value={bpmRange}
              min={60}
              max={200}
              step={5}
              onValueChange={(value) => setBpmRange(value as [number, number])}
            />
          </div>

          {/* Energy Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("energyLevel")}</label>
              <span className="text-sm text-zinc-500">{energyLevel}%</span>
            </div>
            <Slider
              value={[energyLevel]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => setEnergyLevel(value[0])}
            />
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("genres")}</label>
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={`genre-${genre}`}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={() => toggleGenre(genre)}
                  />
                  <label htmlFor={`genre-${genre}`} className="text-sm text-zinc-700 dark:text-zinc-300">
                    {genre}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
