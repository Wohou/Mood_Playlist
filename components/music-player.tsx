"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Youtube, Music } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/context/auth-context"
import { usePlayer } from "@/context/player-context"
import YouTubePlayer from "@/components/youtube-player"

export default function MusicPlayer() {
  const { t } = useTranslation()
  const { youtube } = useAuth()
  const { isPlaying, setIsPlaying, playlistMode, repeatMode, toggleRepeatMode } = usePlayer()
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)

  // Mock song data
  const currentSong = {
    title: "Higher Ground",
    artist: "ODESZA",
    duration: 222, // in seconds
    coverImage: "/placeholder.svg?key=jsnvk",
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div id="music-player-section" className="space-y-4">
      <Tabs defaultValue={playlistMode ? "youtube" : "spotify"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="spotify" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Spotify
          </TabsTrigger>
          <TabsTrigger value="youtube" className="flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            YouTube
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spotify" className="pt-4">
          <div className="flex items-center gap-4">
            <img
              src={currentSong.coverImage || "/placeholder.svg"}
              alt={currentSong.title}
              className="w-12 h-12 rounded-md shadow-sm"
            />

            <div className="flex-grow">
              <div className="font-medium text-zinc-900 dark:text-zinc-50">{currentSong.title}</div>
              <div className="text-sm text-zinc-500">{currentSong.artist}</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 w-10 text-right">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={currentSong.duration}
                step={1}
                onValueChange={(value) => setCurrentTime(value[0])}
                className="flex-grow"
              />
              <span className="text-xs text-zinc-500 w-10">{formatTime(currentSong.duration)}</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  onClick={togglePlay}
                  variant="default"
                  size="icon"
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-full h-10 w-10"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
              </motion.div>

              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRepeatMode}
                className={`text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 ${
                  repeatMode ? "text-purple-500 dark:text-purple-400" : ""
                }`}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-zinc-500" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0])}
                className="w-24"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="youtube" className="pt-4">
          <YouTubePlayer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
