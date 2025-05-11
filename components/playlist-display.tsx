"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Clock, Music, Shuffle, AlertCircle, PlayCircle } from "lucide-react"
import { usePlaylist } from "@/context/playlist-context"
import { usePlayer } from "@/context/player-context"
import { useAuth } from "@/context/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslation } from "@/lib/i18n"
import { useToast } from "@/components/ui/use-toast"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  MeasuringStrategy,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import DraggableSongItem from "./draggable-song-item"
import DeleteConfirmationDialog from "./delete-confirmation-dialog"
// Add these imports at the top
import SectionHeader from "./section-header"
import AddSectionButton from "./add-section-button"

export default function PlaylistDisplay() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { playlist, duration, setPlaylist, reorderSongs } = usePlaylist()
  const { playSongFromPlaylist, setCurrentSongIndex, currentSongIndex } = usePlayer()
  const { youtube } = useAuth()
  const [likedSongs, setLikedSongs] = useState<number[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  // Add these state variables inside the PlaylistDisplay component
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [songToDelete, setSongToDelete] = useState<{ index: number; title: string; artist: string } | null>(null)

  // Ref to track if component is mounted
  const isMounted = useRef(true)

  // Configure DnD sensors with optimal settings
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Use minimal activation constraints for better responsiveness
      activationConstraint: {
        distance: 1, // Very small distance to start drag
        tolerance: 5, // Small tolerance for better control
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Set mounted flag on component mount/unmount
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Load liked songs from localStorage on mount
  useEffect(() => {
    try {
      const savedLikedSongs = localStorage.getItem("liked_songs")
      if (savedLikedSongs) {
        setLikedSongs(JSON.parse(savedLikedSongs))
      }
    } catch (error) {
      console.error("Error loading liked songs:", error)
    }
  }, [])

  // Save liked songs to localStorage when they change
  useEffect(() => {
    if (likedSongs.length > 0) {
      try {
        localStorage.setItem("liked_songs", JSON.stringify(likedSongs))
      } catch (error) {
        console.error("Error saving liked songs:", error)
      }
    }
  }, [likedSongs])

  // Save playlist order to localStorage when it changes
  useEffect(() => {
    if (playlist && isMounted.current) {
      try {
        localStorage.setItem("playlist_order", JSON.stringify(playlist))
      } catch (error) {
        console.error("Error saving playlist order:", error)
      }
    }
  }, [playlist])

  // Load playlist order from localStorage on mount
  useEffect(() => {
    if (!playlist) {
      try {
        const savedPlaylist = localStorage.getItem("playlist_order")
        if (savedPlaylist) {
          setPlaylist(JSON.parse(savedPlaylist))
        }
      } catch (error) {
        console.error("Error loading playlist order:", error)
      }
    }
  }, [playlist, setPlaylist])

  // Toggle like status for a song
  const toggleLike = useCallback(
    (songId: number, e: React.MouseEvent) => {
      e.stopPropagation()

      if (likedSongs.includes(songId)) {
        setLikedSongs(likedSongs.filter((id) => id !== songId))
      } else {
        setLikedSongs([...likedSongs, songId])
      }
    },
    [likedSongs],
  )

  // Handle playing a song
  const handlePlaySong = useCallback(
    (index: number) => {
      // Don't try to play if we're currently dragging
      if (isDragging) {
        console.log("Ignoring play request during drag operation")
        return
      }

      if (!youtube.isAuthenticated) {
        // Scroll to the YouTube player section
        const playerSection = document.getElementById("music-player-section")
        if (playerSection) {
          playerSection.scrollIntoView({ behavior: "smooth" })
        }
        return
      }

      playSongFromPlaylist(index)

      // Scroll to the YouTube player section
      setTimeout(() => {
        const playerSection = document.getElementById("music-player-section")
        if (playerSection) {
          playerSection.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    },
    [youtube.isAuthenticated, playSongFromPlaylist, isDragging],
  )

  // Handle initiating song deletion
  const handleDeleteSong = useCallback(
    (index: number) => {
      if (!playlist) return

      // Store the song to delete and open the confirmation dialog
      setSongToDelete({
        index,
        title: playlist.songs[index].title,
        artist: playlist.songs[index].artist,
      })
      setDeleteDialogOpen(true)
    },
    [playlist],
  )

  // Handle confirming song deletion
  const confirmDeleteSong = useCallback(() => {
    if (!playlist || songToDelete === null) return

    // Create a copy of the songs array without the deleted song
    const newSongs = [...playlist.songs]
    newSongs.splice(songToDelete.index, 1)

    // Update the playlist with the new songs array
    const updatedPlaylist = {
      ...playlist,
      songs: newSongs,
    }

    // Update the current song index if needed
    if (currentSongIndex !== null) {
      if (songToDelete.index === currentSongIndex) {
        // If the current song is being deleted, reset the current song
        setCurrentSongIndex(null)
      } else if (songToDelete.index < currentSongIndex) {
        // If a song before the current song is being deleted, decrement the index
        setCurrentSongIndex(currentSongIndex - 1)
      }
    }

    // Update the playlist state
    setPlaylist(updatedPlaylist)

    // Show a toast notification for the deletion
    toast({
      title: t("songDeleted"),
      description: `${songToDelete.title} - ${songToDelete.artist}`,
      duration: 3000,
    })

    // Close the dialog and reset the song to delete
    setDeleteDialogOpen(false)
    setSongToDelete(null)
  }, [playlist, songToDelete, currentSongIndex, setCurrentSongIndex, setPlaylist, toast, t])

  // Add this function inside the PlaylistDisplay component
  // Toggle section collapse state
  const toggleSectionCollapse = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }, [])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event

    // Set active ID and dragging state
    setActiveId(active.id.toString())
    setIsDragging(true)

    // Check if we're dragging a section
    if (active.data.current?.type === "section") {
      setActiveSectionId(active.id.toString())
    } else {
      // Extract index from the ID (format: "songId-index")
      const activeIdParts = active.id.toString().split("-")
      if (activeIdParts.length >= 2) {
        const index = Number.parseInt(activeIdParts[1], 10)
        if (!isNaN(index)) {
          setDraggedIndex(index)
        }
      }
    }

    // Add a class to the body to prevent scrolling during drag
    document.body.classList.add("dragging-active")

    // Force the browser to acknowledge the drag state
    requestAnimationFrame(() => {
      document.body.style.cursor = "grabbing"
    })
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    // Reset drag states
    setIsDragging(false)
    setDraggedIndex(null)
    setDropTargetIndex(null)
    setActiveSectionId(null)

    // Remove the body class
    document.body.classList.remove("dragging-active")
    document.body.style.cursor = ""

    const { active, over } = event

    // If no over element or no playlist, we can't reorder
    if (!over || !playlist) {
      setActiveId(null)
      return
    }

    // If the active and over elements are the same, no reordering needed
    if (active.id === over.id) {
      setActiveId(null)
      return
    }

    try {
      // Check if we're reordering sections
      if (active.data.current?.type === "section" && over.data.current?.type === "section") {
        const startIndex = playlist.sections.findIndex((section) => section.id === active.id)
        const endIndex = playlist.sections.findIndex((section) => section.id === over.id)

        if (startIndex !== -1 && endIndex !== -1) {
          reorderSections(startIndex, endIndex)
        }

        setActiveId(null)
        return
      }

      // Extract indices from the IDs (format: "songId-index")
      const activeId = active.id.toString()
      const overId = over.id.toString()

      // Check if we're moving a song to a section
      if (over.data.current?.type === "section") {
        const sectionId = over.id.toString()
        const songIdParts = activeId.split("-")

        if (songIdParts.length >= 2) {
          const songIndex = Number(songIdParts[1])
          if (!isNaN(songIndex)) {
            moveSongToSection(songIndex, sectionId)
          }
        }

        setActiveId(null)
        return
      }

      // Parse the indices from the IDs for song reordering
      const activeIdParts = activeId.split("-")
      const overIdParts = overId.split("-")

      if (activeIdParts.length < 2 || overIdParts.length < 2) {
        console.error("Invalid ID format", { activeId, overId })
        setActiveId(null)
        return
      }

      const activeIndex = Number(activeIdParts[1])
      const overIndex = Number(overIdParts[1])

      // Validate the indices
      if (
        isNaN(activeIndex) ||
        isNaN(overIndex) ||
        activeIndex < 0 ||
        overIndex < 0 ||
        activeIndex >= playlist.songs.length ||
        overIndex >= playlist.songs.length
      ) {
        console.error("Invalid indices", { activeIndex, overIndex, playlistLength: playlist.songs.length })
        setActiveId(null)
        return
      }

      // Update the current song index if it's being dragged
      if (currentSongIndex === activeIndex) {
        setCurrentSongIndex(overIndex)
      }
      // Or if the current song is being displaced
      else if (currentSongIndex !== null) {
        if (activeIndex < currentSongIndex && overIndex >= currentSongIndex) {
          setCurrentSongIndex(currentSongIndex - 1)
        } else if (activeIndex > currentSongIndex && overIndex <= currentSongIndex) {
          setCurrentSongIndex(currentSongIndex + 1)
        }
      }

      // Create a new array with the updated order using arrayMove
      const newSongs = arrayMove(playlist.songs, activeIndex, overIndex)

      // Update the playlist with the new order
      const updatedPlaylist = {
        ...playlist,
        songs: newSongs,
      }

      // Update the playlist state
      setPlaylist(updatedPlaylist)
    } catch (error) {
      console.error("Error during drag end handling:", error)
    } finally {
      setActiveId(null)
    }
  }

  // Handle drag cancel
  const handleDragCancel = () => {
    setIsDragging(false)
    setDraggedIndex(null)
    setDropTargetIndex(null)
    setActiveId(null)
    document.body.classList.remove("dragging-active")
    document.body.style.cursor = ""
  }

  // Handle drag over
  const handleDragOver = (event: any) => {
    const { over } = event

    if (over) {
      const overIdParts = over.id.toString().split("-")
      if (overIdParts.length >= 2) {
        const index = Number.parseInt(overIdParts[1], 10)
        if (!isNaN(index)) {
          setDropTargetIndex(index)
        }
      }
    } else {
      setDropTargetIndex(null)
    }
  }

  // Shuffle the playlist
  const shufflePlaylist = () => {
    if (!playlist) return

    // Create a copy of the songs array
    const shuffledSongs = [...playlist.songs]

    // Fisher-Yates shuffle algorithm
    for (let i = shuffledSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]]
    }

    // Update the playlist with shuffled songs
    const shuffledPlaylist = {
      ...playlist,
      songs: shuffledSongs,
    }

    // Update the playlist in context
    setPlaylist(shuffledPlaylist)

    // Reset current song index since order has changed
    setCurrentSongIndex(null)
  }

  // Find the active song for the drag overlay
  const getActiveSong = () => {
    if (!activeId || !playlist) return null

    try {
      const index = Number(activeId.split("-")[1])
      if (isNaN(index) || index < 0 || index >= playlist.songs.length) {
        return null
      }
      return { song: playlist.songs[index], index }
    } catch (error) {
      console.error("Error getting active song:", error)
      return null
    }
  }

  // If no playlist is generated yet
  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Music className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">{t("noPlaylist")}</h3>
        <p className="text-zinc-500 max-w-md mt-2">{t("noPlaylistDesc")}</p>
      </div>
    )
  }

  // Calculate percentage of requested duration
  const requestedDurationSeconds = duration * 60
  const percentageFilled = Math.round((playlist.totalDurationSeconds / requestedDurationSeconds) * 100)
  const isShort = percentageFilled < 90

  // Get the active song for the drag overlay
  const activeSongData = activeId ? getActiveSong() : null

  // Mock functions for section management
  const reorderSections = (startIndex: number, endIndex: number) => {
    console.log(`Reordering sections from ${startIndex} to ${endIndex}`)
    // Implement your logic here
  }

  const moveSongToSection = (songIndex: number, sectionId: string) => {
    console.log(`Moving song at index ${songIndex} to section ${sectionId}`)
    // Implement your logic here
  }

  const addSection = (title: string) => {
    console.log(`Adding section with title: ${title}`)
    // Implement your logic here
  }

  const renameSection = (sectionId: string, newTitle: string) => {
    console.log(`Renaming section ${sectionId} to ${newTitle}`)
    // Implement your logic here
  }

  const deleteSection = (sectionId: string) => {
    console.log(`Deleting section ${sectionId}`)
    // Implement your logic here
  }

  return (
    <div id="playlist-section" className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden shadow-md"
          >
            <img
              src={playlist.coverImage || "/placeholder.svg?height=192&width=192&query=colorful music album cover"}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        <div className="flex-grow space-y-3">
          <div>
            <div className="text-sm font-medium text-purple-500">
              {t(playlist.mood.toLowerCase())} {t("playlist")}
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{playlist.title}</h3>
            <div className="flex items-center text-sm text-zinc-500 mt-1">
              <Clock className="h-4 w-4 mr-1" />
              <span>{playlist.totalDuration}</span>
              <span className="mx-2">•</span>
              <span>
                {playlist.songs.length} {t("songs")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={shufflePlaylist}
              disabled={!playlist || playlist.songs.length <= 1}
            >
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">{t("shuffle")}</span>
            </Button>
            {!youtube.isAuthenticated && (
              <Button size="sm" variant="default" className="gap-1 bg-red-600 hover:bg-red-700" onClick={youtube.login}>
                <PlayCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t("connectToPlay")}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {isShort && (
        <Alert variant="warning" className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
            {t("playlistFillAlert", { percentage: percentageFilled.toString(), duration: duration.toString() })}
          </AlertDescription>
        </Alert>
      )}

      {!youtube.isAuthenticated && (
        <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <PlayCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
            {t("connectYouTubeToPlaySongs")}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1 relative">
        {playlist.sections && playlist.sections.length > 0 ? (
          <>
            <AddSectionButton onAddSection={(title) => addSection(title)} />

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              onDragOver={handleDragOver}
              modifiers={[restrictToVerticalAxis]}
              measuring={{
                droppable: {
                  strategy: MeasuringStrategy.Always,
                },
              }}
            >
              <SortableContext
                items={playlist.sections.map((section) => section.id)}
                strategy={verticalListSortingStrategy}
              >
                {playlist.sections.map((section) => (
                  <div key={section.id} className="mb-4">
                    <SectionHeader
                      id={section.id}
                      title={section.title}
                      isCollapsed={!!collapsedSections[section.id]}
                      onToggleCollapse={() => toggleSectionCollapse(section.id)}
                      onRename={(newTitle) => renameSection(section.id, newTitle)}
                      onDelete={() => deleteSection(section.id)}
                    />

                    {!collapsedSections[section.id] && (
                      <SortableContext
                        items={section.songs.map((song, index) => `${song.id}-${index}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        {section.songs.map((song, index) => (
                          <motion.div
                            key={`${song.id}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`sortable-item ${
                              dropTargetIndex === index && draggedIndex !== index
                                ? "border-t-2 border-purple-500 dark:border-purple-400"
                                : ""
                            }`}
                          >
                            <DraggableSongItem
                              song={song}
                              index={index}
                              currentSongIndex={currentSongIndex}
                              likedSongs={likedSongs}
                              toggleLike={toggleLike}
                              handlePlaySong={handlePlaySong}
                              handleDeleteSong={handleDeleteSong}
                              isDragging={isDragging && draggedIndex === index}
                            />
                          </motion.div>
                        ))}
                      </SortableContext>
                    )}
                  </div>
                ))}
              </SortableContext>

              {/* Drag overlay for better visual feedback */}
              <DragOverlay
                dropAnimation={{
                  duration: 200,
                  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                  sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                      active: {
                        opacity: "0.4",
                      },
                    },
                  }),
                }}
                zIndex={999} // Ensure high z-index
                className="sortable-item-dragging"
              >
                {activeId && activeSongData && !activeSectionId && (
                  <div className="bg-zinc-100 dark:bg-zinc-800 shadow-lg rounded-md p-2 border-2 border-purple-400 dark:border-purple-600 w-full max-w-[calc(100vw-40px)]">
                    <div className="flex items-center">
                      <div className="w-8 text-center">
                        <span className="text-zinc-400 font-medium">{activeSongData.index + 1}</span>
                      </div>
                      <div className="flex-grow ml-2 overflow-hidden">
                        <div className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
                          {activeSongData.song.title}
                        </div>
                        <div className="text-sm text-zinc-500 truncate">{activeSongData.song.artist}</div>
                      </div>
                      <div className="text-sm text-zinc-500 mr-2">{activeSongData.song.duration}</div>
                    </div>
                  </div>
                )}

                {activeSectionId && playlist.sections && (
                  <div className="bg-zinc-100 dark:bg-zinc-800 shadow-lg rounded-md p-2 border-2 border-purple-400 dark:border-purple-600 w-full max-w-[calc(100vw-40px)]">
                    <div className="flex items-center">
                      <div className="w-4 h-4 flex flex-col items-center justify-center gap-1 mr-2">
                        <div className="w-4 h-0.5 bg-zinc-400 dark:bg-zinc-500 rounded-full"></div>
                        <div className="w-4 h-0.5 bg-zinc-400 dark:bg-zinc-500 rounded-full"></div>
                      </div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {playlist.sections.find((s) => s.id === activeSectionId)?.title || "Section"}
                      </div>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </>
        ) : (
          <>
            <AddSectionButton onAddSection={(title) => addSection(title)} />

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              onDragOver={handleDragOver}
              modifiers={[restrictToVerticalAxis]}
              measuring={{
                droppable: {
                  strategy: MeasuringStrategy.Always,
                },
              }}
            >
              <SortableContext
                items={playlist.songs.map((song, index) => `${song.id}-${index}`)}
                strategy={verticalListSortingStrategy}
              >
                {playlist.songs.map((song, index) => (
                  <motion.div
                    key={`${song.id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`sortable-item ${
                      dropTargetIndex === index && draggedIndex !== index
                        ? "border-t-2 border-purple-500 dark:border-purple-400"
                        : ""
                    }`}
                  >
                    <DraggableSongItem
                      song={song}
                      index={index}
                      currentSongIndex={currentSongIndex}
                      likedSongs={likedSongs}
                      toggleLike={toggleLike}
                      handlePlaySong={handlePlaySong}
                      handleDeleteSong={handleDeleteSong}
                      isDragging={isDragging && draggedIndex === index}
                    />
                  </motion.div>
                ))}
              </SortableContext>

              {/* Drag overlay for better visual feedback */}
              <DragOverlay
                dropAnimation={{
                  duration: 200,
                  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                  sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                      active: {
                        opacity: "0.4",
                      },
                    },
                  }),
                }}
                zIndex={999} // Ensure high z-index
                className="sortable-item-dragging"
              >
                {activeId && activeSongData && (
                  <div className="bg-zinc-100 dark:bg-zinc-800 shadow-lg rounded-md p-2 border-2 border-purple-400 dark:border-purple-600 w-full max-w-[calc(100vw-40px)]">
                    <div className="flex items-center">
                      <div className="w-8 text-center">
                        <span className="text-zinc-400 font-medium">{activeSongData.index + 1}</span>
                      </div>
                      <div className="flex-grow ml-2 overflow-hidden">
                        <div className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
                          {activeSongData.song.title}
                        </div>
                        <div className="text-sm text-zinc-500 truncate">{activeSongData.song.artist}</div>
                      </div>
                      <div className="text-sm text-zinc-500 mr-2">{activeSongData.song.duration}</div>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {songToDelete && (
        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSongToDelete(null)
          }}
          onConfirm={confirmDeleteSong}
          songTitle={songToDelete.title}
          songArtist={songToDelete.artist}
        />
      )}
    </div>
  )
}
