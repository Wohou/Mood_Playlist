"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Smile, Coffee, Zap, CloudRain, Music, Heart, Flame, Moon } from "lucide-react"
import { usePlaylist } from "@/context/playlist-context"
import { useTranslation } from "@/lib/i18n"

type Mood = {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

const moods: Mood[] = [
  {
    id: "happy",
    name: "Happy",
    icon: <Smile className="h-6 w-6" />,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    id: "chill",
    name: "Chill",
    icon: <Coffee className="h-6 w-6" />,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "energetic",
    name: "Energetic",
    icon: <Zap className="h-6 w-6" />,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    id: "melancholic",
    name: "Melancholic",
    icon: <CloudRain className="h-6 w-6" />,
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  {
    id: "focus",
    name: "Focus",
    icon: <Music className="h-6 w-6" />,
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: "romantic",
    name: "Romantic",
    icon: <Heart className="h-6 w-6" />,
    color: "text-pink-500",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
  },
  {
    id: "angry",
    name: "Angry",
    icon: <Flame className="h-6 w-6" />,
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  {
    id: "sleepy",
    name: "Sleepy",
    icon: <Moon className="h-6 w-6" />,
    color: "text-indigo-500",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
  },
]

export default function MoodSelector() {
  const { t } = useTranslation()
  const { selectedMood, setSelectedMood } = usePlaylist()

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("selectMood")}</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {moods.map((mood) => (
          <motion.button
            key={mood.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedMood(mood.id)}
            className={`
              flex flex-col items-center justify-center p-3 rounded-lg transition-colors
              ${
                selectedMood === mood.id
                  ? `${mood.bgColor} ${mood.color} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-zinc-200 dark:ring-zinc-700`
                  : "bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-400"
              }
            `}
          >
            <div className={`${selectedMood === mood.id ? mood.color : ""}`}>{mood.icon}</div>
            <span className="mt-1 text-sm font-medium">{t(mood.id)}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
