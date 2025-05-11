"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

export type Mood = {
  id: string
  name: string
}

export type Song = {
  id: number
  title: string
  artist: string
  duration: string
  durationSeconds: number
  bpm: number
  energy: number
  genres: string[]
  videoId?: string // Optional field for YouTube video ID
}

export type Playlist = {
  title: string
  coverImage: string
  songs: Song[]
  totalDuration: string
  totalDurationSeconds: number
  mood: string
}

type PlaylistContextType = {
  selectedMood: string
  setSelectedMood: (mood: string) => void
  duration: number
  setDuration: (duration: number) => void
  bpmRange: [number, number]
  setBpmRange: (range: [number, number]) => void
  energyLevel: number
  setEnergyLevel: (level: number) => void
  selectedGenres: string[]
  setSelectedGenres: (genres: string[]) => void
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
  playlist: Playlist | null
  setPlaylist: (playlist: Playlist | null) => void
  generatePlaylist: () => Promise<void>
  reorderSongs: (startIndex: number, endIndex: number) => void
  addSongToPlaylist: (song: Song) => void
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined)

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [selectedMood, setSelectedMood] = useState<string>("happy")
  const [duration, setDuration] = useState<number>(60)
  const [bpmRange, setBpmRange] = useState<[number, number]>([80, 140])
  const [energyLevel, setEnergyLevel] = useState<number>(50)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load saved playlist from localStorage on mount
  useEffect(() => {
    try {
      const savedPlaylist = localStorage.getItem("playlist_order")
      if (savedPlaylist && !playlist) {
        setPlaylist(JSON.parse(savedPlaylist))
      }
      setIsInitialized(true)
    } catch (error) {
      console.error("Error loading saved playlist:", error)
      setIsInitialized(true)
    }
  }, [playlist])

  // Save playlist to localStorage when it changes
  useEffect(() => {
    if (playlist && isInitialized) {
      try {
        localStorage.setItem("playlist_order", JSON.stringify(playlist))
      } catch (error) {
        console.error("Error saving playlist to localStorage:", error)
      }
    }
  }, [playlist, isInitialized])

  // Add a song to the playlist
  const addSongToPlaylist = useCallback(
    (song: Song) => {
      if (!playlist) return

      // Add the song to the playlist
      const updatedSongs = [...playlist.songs, song]

      // Update total duration
      const newTotalDurationSeconds = playlist.totalDurationSeconds + song.durationSeconds

      // Format the new total duration
      const hours = Math.floor(newTotalDurationSeconds / 3600)
      const minutes = Math.floor((newTotalDurationSeconds % 3600) / 60)
      const seconds = newTotalDurationSeconds % 60

      let formattedDuration = ""
      if (hours > 0) {
        formattedDuration = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      } else {
        formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`
      }

      // Update the playlist
      const updatedPlaylist = {
        ...playlist,
        songs: updatedSongs,
        totalDuration: formattedDuration,
        totalDurationSeconds: newTotalDurationSeconds,
      }

      setPlaylist(updatedPlaylist)
    },
    [playlist],
  )

  // Reorder songs in the playlist
  const reorderSongs = useCallback(
    (startIndex: number, endIndex: number) => {
      if (!playlist) return

      // Validate indices
      if (startIndex < 0 || endIndex < 0 || startIndex >= playlist.songs.length || endIndex >= playlist.songs.length) {
        console.error("Invalid indices for reordering", { startIndex, endIndex, playlistLength: playlist.songs.length })
        return
      }

      // Create a copy of the songs array
      const result = Array.from(playlist.songs)

      // Remove the item from its original position
      const [removed] = result.splice(startIndex, 1)

      // Insert it at the new position
      result.splice(endIndex, 0, removed)

      // Update the playlist with the new order
      setPlaylist({
        ...playlist,
        songs: result,
      })

      // Save to localStorage
      try {
        localStorage.setItem(
          "playlist_order",
          JSON.stringify({
            ...playlist,
            songs: result,
          }),
        )
      } catch (error) {
        console.error("Error saving reordered playlist:", error)
      }
    },
    [playlist],
  )

  // Generate a new playlist
  const generatePlaylist = useCallback(async () => {
    setIsGenerating(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const response = await fetch("/api/generate-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood: selectedMood,
          duration,
          bpmRange,
          energyLevel,
          genres: selectedGenres,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate playlist: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.playlist) {
        throw new Error("Invalid response format: missing playlist data")
      }

      setPlaylist(data.playlist)

      // Save the new playlist to localStorage
      localStorage.setItem("playlist_order", JSON.stringify(data.playlist))

      // Scroll to playlist section
      setTimeout(() => {
        const playlistSection = document.getElementById("playlist-section")
        if (playlistSection) {
          playlistSection.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    } catch (error) {
      console.error("Error generating playlist:", error)
      // Handle error state here
    } finally {
      setIsGenerating(false)
    }
  }, [selectedMood, duration, bpmRange, energyLevel, selectedGenres])

  return (
    <PlaylistContext.Provider
      value={{
        selectedMood,
        setSelectedMood,
        duration,
        setDuration,
        bpmRange,
        setBpmRange,
        energyLevel,
        setEnergyLevel,
        selectedGenres,
        setSelectedGenres,
        isGenerating,
        setIsGenerating,
        playlist,
        setPlaylist,
        generatePlaylist,
        reorderSongs,
        addSongToPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylist() {
  const context = useContext(PlaylistContext)
  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider")
  }
  return context
}
