"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { usePlaylist } from "@/context/playlist-context"
import { useAuth } from "@/context/auth-context"
import { searchYouTubeVideos } from "@/lib/api/youtube"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"

export type VideoInfo = {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
}

type PlayerContextType = {
  currentSongIndex: number | null
  setCurrentSongIndex: (index: number | null) => void
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
  currentVideo: VideoInfo | null
  setCurrentVideo: (video: VideoInfo | null) => void
  isLoading: boolean
  playlistMode: boolean
  setPlaylistMode: (mode: boolean) => void
  playNextSong: () => void
  playPreviousSong: () => void
  playSongFromPlaylist: (index: number) => Promise<void>
  repeatMode: boolean
  toggleRepeatMode: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { playlist } = usePlaylist()
  const { youtube } = useAuth()
  const { toast } = useToast()
  const { t } = useTranslation()

  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<VideoInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [playlistMode, setPlaylistMode] = useState(true)
  const [repeatMode, setRepeatMode] = useState<boolean>(false)

  // Reset current song index when playlist changes completely (not just reordering)
  useEffect(() => {
    if (!playlist) {
      setCurrentSongIndex(null)
      setCurrentVideo(null)
    }
  }, [playlist])

  useEffect(() => {
    try {
      const savedRepeatMode = localStorage.getItem("player_repeat_mode")
      if (savedRepeatMode !== null) {
        setRepeatMode(JSON.parse(savedRepeatMode))
      }
    } catch (error) {
      console.error("Error loading repeat mode:", error)
    }
  }, [])

  // Add this useEffect to save repeat state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("player_repeat_mode", JSON.stringify(repeatMode))
    } catch (error) {
      console.error("Error saving repeat mode:", error)
    }
  }, [repeatMode])

  const toggleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => !prev)
  }, [])

  const playNextSong = () => {
    if (!playlist || currentSongIndex === null) return

    const nextIndex = currentSongIndex + 1
    if (nextIndex < playlist.songs.length) {
      playSongFromPlaylist(nextIndex)
    } else if (repeatMode && playlist.songs.length > 0) {
      // If repeat is enabled and we're at the end, go back to the first song
      playSongFromPlaylist(0)
    }
  }

  // Play previous song in playlist
  const playPreviousSong = () => {
    if (!playlist || currentSongIndex === null) return

    const prevIndex = currentSongIndex - 1
    if (prevIndex >= 0) {
      playSongFromPlaylist(prevIndex)
    }
  }

  // Play a specific song from the playlist
  const playSongFromPlaylist = async (index: number) => {
    if (!playlist || !youtube.isAuthenticated) return

    setIsLoading(true)
    setCurrentSongIndex(index)

    const song = playlist.songs[index]
    const searchQuery = `${song.title} ${song.artist}`

    try {
      const results = await searchYouTubeVideos(youtube.auth!.accessToken, searchQuery)

      if (results.items && results.items.length > 0) {
        const videoItem = results.items[0]
        const video: VideoInfo = {
          id: videoItem.id.videoId,
          title: videoItem.snippet.title,
          thumbnail: videoItem.snippet.thumbnails.medium?.url || videoItem.snippet.thumbnails.default?.url,
          channelTitle: videoItem.snippet.channelTitle,
        }

        setCurrentVideo(video)
        setIsPlaying(true)
        setPlaylistMode(true)

        // Add to video history
        const videoHistory = JSON.parse(localStorage.getItem("youtube_video_history") || "[]")
        if (!videoHistory.some((v: VideoInfo) => v.id === video.id)) {
          localStorage.setItem("youtube_video_history", JSON.stringify([video, ...videoHistory].slice(0, 10)))
        }
      } else {
        toast({
          title: t("searchError"),
          description: t("noResultsFound", { song: `${song.title} - ${song.artist}` }),
          variant: "destructive",
        })
        setCurrentVideo(null)
      }
    } catch (error) {
      console.error("Error searching for song:", error)
      toast({
        title: t("searchError"),
        description: t("failedToSearchSong"),
        variant: "destructive",
      })
      setCurrentVideo(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PlayerContext.Provider
      value={{
        currentSongIndex,
        setCurrentSongIndex,
        isPlaying,
        setIsPlaying,
        currentVideo,
        setCurrentVideo,
        isLoading,
        playlistMode,
        setPlaylistMode,
        playNextSong,
        playPreviousSong,
        playSongFromPlaylist,
        repeatMode,
        toggleRepeatMode,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider")
  }
  return context
}
