"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import ReactPlayer from "react-player/youtube"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Search, Play, Youtube, History, SkipBack, SkipForward, Repeat, PlusCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { usePlayer, type VideoInfo } from "@/context/player-context"
import { usePlaylist } from "@/context/playlist-context"
import { useTranslation } from "@/lib/i18n"
import { searchYouTubeVideos } from "@/lib/api/youtube"

export default function YouTubePlayer() {
  const { t } = useTranslation()
  const { youtube } = useAuth()
  const { toast } = useToast()
  const { playlist, addSongToPlaylist } = usePlaylist()
  const {
    currentSongIndex,
    isPlaying,
    setIsPlaying,
    currentVideo,
    setCurrentVideo,
    isLoading: playerLoading,
    setPlaylistMode,
    playlistMode,
    playNextSong,
    playPreviousSong,
    repeatMode,
    toggleRepeatMode,
    playSongFromPlaylist,
  } = usePlayer()

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<VideoInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [playerTab, setPlayerTab] = useState<"search" | "history">("search")
  const [videoHistory, setVideoHistory] = useState<VideoInfo[]>([])
  const playerRef = useRef<ReactPlayer>(null)

  // Load video history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("youtube_video_history")
      if (savedHistory) {
        setVideoHistory(JSON.parse(savedHistory))
      }
    } catch (error) {
      console.error("Error loading video history:", error)
    }
  }, [])

  // Save video history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("youtube_video_history", JSON.stringify(videoHistory))
    } catch (error) {
      console.error("Error saving video history:", error)
    }
  }, [videoHistory])

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    if (!youtube.isAuthenticated) {
      toast({
        title: t("authRequired"),
        description: t("youtubeAuthRequired"),
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)

    try {
      const results = await searchYouTubeVideos(youtube.auth!.accessToken, searchQuery)

      const formattedResults: VideoInfo[] = results.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
      }))

      setSearchResults(formattedResults)
    } catch (error) {
      console.error("Error searching YouTube videos:", error)
      toast({
        title: t("searchError"),
        description: t("youtubeSearchError"),
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Handle video selection for playback
  const handleVideoSelect = (video: VideoInfo) => {
    setCurrentVideo(video)
    setIsPlaying(true)
    setPlaylistMode(false)

    // Add to history if not already there
    if (!videoHistory.some((v) => v.id === video.id)) {
      setVideoHistory((prev) => [video, ...prev].slice(0, 10)) // Keep only the 10 most recent
    } else {
      // Move to top of history
      setVideoHistory((prev) => [video, ...prev.filter((v) => v.id !== video.id)].slice(0, 10))
    }
  }

  // Handle adding a video to the playlist
  const handleAddToPlaylist = (video: VideoInfo, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click

    if (!playlist) {
      toast({
        title: t("noPlaylist"),
        description: t("generatePlaylistFirst"),
        variant: "destructive",
      })
      return
    }

    // Convert video to song format and add to playlist
    const newSong = {
      id: Date.now(), // Generate a unique ID
      title: video.title,
      artist: video.channelTitle,
      duration: "3:30", // Default duration since we don't have this info
      durationSeconds: 210, // Default 3:30 in seconds
      bpm: 120, // Default values
      energy: 60,
      genres: ["YouTube"],
      videoId: video.id, // Store the YouTube video ID
    }

    addSongToPlaylist(newSong)

    toast({
      title: t("songAdded"),
      description: t("songAddedToPlaylist", { title: video.title }),
      variant: "default",
    })
  }

  // Handle player ready
  const handlePlayerReady = () => {
    setIsLoading(false)
  }

  // Handle player error
  const handlePlayerError = (error: any) => {
    console.error("YouTube player error:", error)
    setIsLoading(false)
    toast({
      title: t("playbackError"),
      description: t("youtubePlaybackError"),
      variant: "destructive",
    })

    // If in playlist mode and error occurs, try to play the next song
    if (playlistMode && currentSongIndex !== null) {
      playNextSong()
    }
  }

  // Handle end of video
  const handleVideoEnded = () => {
    if (playlistMode && currentSongIndex !== null) {
      const isLastSong = currentSongIndex >= playlist.songs.length - 1
      if (isLastSong && repeatMode && playlist.songs.length > 0) {
        // If it's the last song and repeat is enabled, play the first song
        playSongFromPlaylist(0)
      } else if (!isLastSong) {
        // If it's not the last song, play the next song
        playNextSong()
      }
    }
  }

  if (!youtube.isAuthenticated) {
    return (
      <div className="text-center p-4">
        <Youtube className="h-10 w-10 text-zinc-400 mx-auto mb-2" />
        <p className="text-zinc-600 dark:text-zinc-400">{t("connectYouTubeAccount")}</p>
        <Button className="mt-3" variant="outline" size="sm" onClick={youtube.login}>
          {t("connectYouTube")}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {playlistMode && playlist && (
        <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-purple-500 rounded-full mr-3"></div>
            <div>
              <p className="font-medium text-sm">{t("nowPlayingFromPlaylist")}</p>
              <p className="text-xs text-zinc-500">
                {currentSongIndex !== null && playlist.songs[currentSongIndex]
                  ? `${playlist.songs[currentSongIndex].title} - ${playlist.songs[currentSongIndex].artist}`
                  : t("selectSongFromPlaylist")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={playPreviousSong}
              disabled={currentSongIndex === 0 || currentSongIndex === null}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={playNextSong}
              disabled={currentSongIndex === null || currentSongIndex >= playlist.songs.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={repeatMode ? "default" : "outline"}
              onClick={toggleRepeatMode}
              className={repeatMode ? "bg-purple-500 hover:bg-purple-600 text-white" : ""}
              title={repeatMode ? t("repeatEnabled") : t("repeatDisabled")}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Tabs value={playerTab} onValueChange={(value) => setPlayerTab(value as "search" | "history")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t("search")}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t("history")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder={t("searchYouTube")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <span className="flex items-center gap-1">
                  <span className="animate-spin">⏳</span> {t("searching")}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Search className="h-4 w-4" /> {t("search")}
                </span>
              )}
            </Button>
          </form>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
              {searchResults.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group"
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-purple-500 hover:bg-purple-600 text-white rounded-full h-10 w-10 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleVideoSelect(video)
                          }}
                          title={t("playSong")}
                        >
                          <Play className="h-5 w-5 ml-0.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full h-10 w-10 flex items-center justify-center"
                          onClick={(e) => handleAddToPlaylist(video, e)}
                          title={t("addToPlaylist")}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-2">
                    <p className="font-medium text-sm line-clamp-1">{video.title}</p>
                    <p className="text-xs text-zinc-500">{video.channelTitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <p className="text-center text-zinc-500 py-4">{t("noResults")}</p>
          ) : null}
        </TabsContent>

        <TabsContent value="history">
          {videoHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
              {videoHistory.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group"
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-purple-500 hover:bg-purple-600 text-white rounded-full h-10 w-10 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleVideoSelect(video)
                          }}
                          title={t("playSong")}
                        >
                          <Play className="h-5 w-5 ml-0.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full h-10 w-10 flex items-center justify-center"
                          onClick={(e) => handleAddToPlaylist(video, e)}
                          title={t("addToPlaylist")}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-2">
                    <p className="font-medium text-sm line-clamp-1">{video.title}</p>
                    <p className="text-xs text-zinc-500">{video.channelTitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-500 py-4">{t("noHistory")}</p>
          )}
        </TabsContent>
      </Tabs>

      {currentVideo ? (
        <div className="space-y-2">
          {(isLoading || playerLoading) && <Skeleton className="w-full aspect-video rounded-md" />}
          <div className={`aspect-video rounded-md overflow-hidden ${isLoading || playerLoading ? "hidden" : "block"}`}>
            <ReactPlayer
              ref={playerRef}
              url={`https://www.youtube.com/watch?v=${currentVideo.id}`}
              width="100%"
              height="100%"
              playing={isPlaying}
              controls={true}
              onReady={handlePlayerReady}
              onError={handlePlayerError}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onStart={() => setIsLoading(false)}
              onBuffer={() => setIsLoading(true)}
              onBufferEnd={() => setIsLoading(false)}
              onEnded={handleVideoEnded}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                  },
                },
              }}
            />
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-50 line-clamp-2">{currentVideo.title}</h3>
            <p className="text-sm text-zinc-500">{currentVideo.channelTitle}</p>
          </div>
        </div>
      ) : (
        <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-md flex items-center justify-center">
          <div className="text-center p-4">
            <Youtube className="h-10 w-10 text-zinc-400 mx-auto mb-2" />
            <p className="text-zinc-600 dark:text-zinc-400">
              {playlistMode ? t("selectSongFromPlaylist") : t("selectVideoToPlay")}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
