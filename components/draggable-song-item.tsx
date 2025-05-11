"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Heart, MoreHorizontal, GripVertical, Play, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/lib/i18n"
import type { Song } from "@/context/playlist-context"

interface DraggableSongItemProps {
  song: Song
  index: number
  currentSongIndex: number | null
  likedSongs: number[]
  toggleLike: (songId: number, e: React.MouseEvent) => void
  handlePlaySong: (index: number) => void
  handleDeleteSong: (index: number) => void
  isDragging: boolean
}

export default function DraggableSongItem({
  song,
  index,
  currentSongIndex,
  likedSongs,
  toggleLike,
  handlePlaySong,
  handleDeleteSong,
  isDragging: isThisItemDragging,
}: DraggableSongItemProps) {
  const { t } = useTranslation()

  // Configure the sortable item with proper ID and data
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${song.id}-${index}`,
    data: {
      index,
      songId: song.id,
      type: "song",
    },
  })

  // Apply transform styles for drag movement
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    // Make the original item invisible when it's being dragged
    opacity: isThisItemDragging ? 0 : 1,
    position: "relative" as const,
    pointerEvents: isDragging ? "none" : "auto", // Prevent pointer events during drag
  }

  // Handle click on the song item (separate from drag)
  const handleClick = (e: React.MouseEvent) => {
    // Only trigger play if we're not dragging
    if (!isDragging) {
      handlePlaySong(index)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-2 rounded-md transition-colors duration-150 
        ${isDragging ? "bg-zinc-100 dark:bg-zinc-800 shadow-md ring-2 ring-purple-300 dark:ring-purple-700" : ""}
        hover:bg-zinc-100 dark:hover:bg-zinc-800/90 
        hover:shadow-sm dark:hover:shadow-zinc-900/50
        group ${
          currentSongIndex === index
            ? "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500"
            : "border-l-4 border-transparent"
        }`}
    >
      {/* Drag handle - this is the ONLY element that should have drag listeners */}
      <div
        className="mr-2 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 touch-none drag-handle"
        {...listeners}
        {...attributes}
        aria-label={t("dragToReorder")}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Song information - clickable for playing, NOT for dragging */}
      <div className="flex-grow flex items-center" onClick={handleClick}>
        <div className="w-8 text-center">
          {currentSongIndex === index ? (
            <span className="inline-block w-4 h-4 rounded-full bg-purple-500 animate-pulse"></span>
          ) : (
            <span className="text-zinc-400 font-medium">{index + 1}</span>
          )}
        </div>
        <div className="flex-grow ml-2">
          <div
            className={`font-medium transition-colors duration-150
              group-hover:text-zinc-900 dark:group-hover:text-white
              ${currentSongIndex === index ? "text-purple-700 dark:text-purple-300" : "text-zinc-900 dark:text-zinc-50"}`}
          >
            {song.title}
          </div>
          <div className="text-sm text-zinc-500 transition-colors duration-150 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
            {song.artist}
          </div>
        </div>
        <div className="text-sm text-zinc-500 transition-colors duration-150 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 mr-2">
          {song.duration}
        </div>
      </div>

      {/* Like button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleLike(song.id, e)
        }}
        className={`transition-all duration-150 ${
          likedSongs.includes(song.id)
            ? "opacity-100" // Always visible when liked
            : "opacity-0 group-hover:opacity-100" // Only visible on hover when not liked
        }`}
        aria-label={likedSongs.includes(song.id) ? t("unlikeSong") : t("likeSong")}
      >
        <Heart
          className={`h-5 w-5 ${
            likedSongs.includes(song.id) ? "text-pink-500 fill-pink-500" : "text-zinc-400 hover:text-pink-500"
          }`}
        />
      </button>

      {/* Dropdown menu - Modified to include Delete Song and remove other options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-5 w-5 text-zinc-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              handlePlaySong(index)
            }}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {t("playSong")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteSong(index)
            }}
            className="flex items-center gap-2 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50"
          >
            <Trash2 className="h-4 w-4" />
            {t("deleteSong")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
