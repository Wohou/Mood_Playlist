"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getSpotifyAuthUrl, refreshSpotifyToken } from "@/lib/api/spotify"
import { getYouTubeAuthUrl, refreshYouTubeToken } from "@/lib/api/youtube"

// Types for our authentication state
export type SpotifyAuth = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    displayName: string | null
    email?: string
    imageUrl?: string
  } | null
}

export type YouTubeAuth = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  channel: {
    id: string
    title: string
    description: string
    thumbnailUrl?: string
  } | null
}

type AuthContextType = {
  spotify: {
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    auth: SpotifyAuth | null
    login: () => void
    logout: () => void
  }
  youtube: {
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    auth: YouTubeAuth | null
    login: () => Promise<void>
    logout: () => void
  }
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Spotify state
  const [spotifyAuth, setSpotifyAuth] = useState<SpotifyAuth | null>(null)
  const [spotifyLoading, setSpotifyLoading] = useState(true)
  const [spotifyError, setSpotifyError] = useState<string | null>(null)

  // YouTube state
  const [youtubeAuth, setYoutubeAuth] = useState<YouTubeAuth | null>(null)
  const [youtubeLoading, setYoutubeLoading] = useState(true)
  const [youtubeError, setYoutubeError] = useState<string | null>(null)

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      // Load Spotify auth
      const spotifyAuthData = localStorage.getItem("spotify_auth")
      if (spotifyAuthData) {
        const parsedAuth = JSON.parse(spotifyAuthData) as SpotifyAuth

        // Check if token is expired and needs refresh
        if (parsedAuth.expiresAt < Date.now()) {
          // Token is expired, we'll handle refresh in another effect
          console.log("Spotify token expired, will refresh")
        } else {
          setSpotifyAuth(parsedAuth)
        }
      }

      // Load YouTube auth
      const youtubeAuthData = localStorage.getItem("youtube_auth")
      if (youtubeAuthData) {
        const parsedAuth = JSON.parse(youtubeAuthData) as YouTubeAuth

        // Check if token is expired and needs refresh
        if (parsedAuth.expiresAt < Date.now()) {
          // Token is expired, we'll handle refresh in another effect
          console.log("YouTube token expired, will refresh")
        } else {
          setYoutubeAuth(parsedAuth)
        }
      }

      // Check for auth success in URL
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get("youtube_auth_success") === "true") {
          // Clear the URL parameter
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete("youtube_auth_success")
          window.history.replaceState({}, document.title, newUrl.toString())
        }
      }
    } catch (error) {
      console.error("Error loading auth state:", error)
    } finally {
      setSpotifyLoading(false)
      setYoutubeLoading(false)
    }
  }, [])

  // Handle Spotify token refresh
  useEffect(() => {
    const refreshSpotify = async () => {
      if (!spotifyAuth || !spotifyAuth.refreshToken) return

      // Only refresh if token is expired or about to expire (within 5 minutes)
      if (spotifyAuth.expiresAt > Date.now() + 5 * 60 * 1000) return

      try {
        setSpotifyLoading(true)
        const tokenData = await refreshSpotifyToken(spotifyAuth.refreshToken)

        // Update auth state with new token
        const updatedAuth: SpotifyAuth = {
          ...spotifyAuth,
          accessToken: tokenData.access_token,
          expiresAt: Date.now() + tokenData.expires_in * 1000,
          // Keep the refresh token if a new one wasn't provided
          refreshToken: tokenData.refresh_token || spotifyAuth.refreshToken,
        }

        setSpotifyAuth(updatedAuth)
        localStorage.setItem("spotify_auth", JSON.stringify(updatedAuth))
      } catch (error) {
        console.error("Error refreshing Spotify token:", error)
        setSpotifyError("Failed to refresh authentication. Please log in again.")
        // Clear invalid auth
        setSpotifyAuth(null)
        localStorage.removeItem("spotify_auth")
      } finally {
        setSpotifyLoading(false)
      }
    }

    // Set up interval to check token expiration
    const intervalId = setInterval(refreshSpotify, 60 * 1000) // Check every minute

    // Run once on mount
    refreshSpotify()

    return () => clearInterval(intervalId)
  }, [spotifyAuth])

  // Handle YouTube token refresh
  useEffect(() => {
    const refreshYoutube = async () => {
      if (!youtubeAuth || !youtubeAuth.refreshToken) return

      // Only refresh if token is expired or about to expire (within 5 minutes)
      if (youtubeAuth.expiresAt > Date.now() + 5 * 60 * 1000) return

      try {
        setYoutubeLoading(true)
        const tokenData = await refreshYouTubeToken(youtubeAuth.refreshToken)

        // Update auth state with new token
        const updatedAuth: YouTubeAuth = {
          ...youtubeAuth,
          accessToken: tokenData.access_token,
          expiresAt: Date.now() + tokenData.expires_in * 1000,
          // Keep the refresh token if a new one wasn't provided
          refreshToken: tokenData.refresh_token || youtubeAuth.refreshToken,
        }

        setYoutubeAuth(updatedAuth)
        localStorage.setItem("youtube_auth", JSON.stringify(updatedAuth))
      } catch (error) {
        console.error("Error refreshing YouTube token:", error)
        setYoutubeError("Failed to refresh authentication. Please log in again.")
        // Clear invalid auth
        setYoutubeAuth(null)
        localStorage.removeItem("youtube_auth")
      } finally {
        setYoutubeLoading(false)
      }
    }

    // Set up interval to check token expiration
    const intervalId = setInterval(refreshYoutube, 60 * 1000) // Check every minute

    // Run once on mount
    refreshYoutube()

    return () => clearInterval(intervalId)
  }, [youtubeAuth])

  // Login functions
  const loginSpotify = () => {
    try {
      setSpotifyLoading(true)
      setSpotifyError(null)
      const { url } = getSpotifyAuthUrl()
      window.location.href = url
    } catch (error) {
      console.error("Error initiating Spotify login:", error)
      setSpotifyError("Failed to initiate Spotify login")
      setSpotifyLoading(false)
    }
  }

  const loginYouTube = async () => {
    try {
      setYoutubeLoading(true)
      setYoutubeError(null)

      // Clear any existing YouTube auth data
      localStorage.removeItem("youtube_auth")

      // Clear any existing code verifiers
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("youtube_cv_")) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      // Get new auth URL with proper code verifier
      const { url, state } = await getYouTubeAuthUrl()

      // Navigate to the authorization URL
      window.location.href = url
    } catch (error) {
      console.error("Error initiating YouTube login:", error)
      setYoutubeError("Failed to initiate YouTube login")
      setYoutubeLoading(false)
    }
  }

  // Logout functions
  const logoutSpotify = () => {
    setSpotifyAuth(null)
    localStorage.removeItem("spotify_auth")
  }

  const logoutYouTube = () => {
    setYoutubeAuth(null)
    localStorage.removeItem("youtube_auth")

    // Clear any code verifiers
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("youtube_cv_")) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }

  // Create context value
  const contextValue: AuthContextType = {
    spotify: {
      isAuthenticated: !!spotifyAuth,
      isLoading: spotifyLoading,
      error: spotifyError,
      auth: spotifyAuth,
      login: loginSpotify,
      logout: logoutSpotify,
    },
    youtube: {
      isAuthenticated: !!youtubeAuth,
      isLoading: youtubeLoading,
      error: youtubeError,
      auth: youtubeAuth,
      login: loginYouTube,
      logout: logoutYouTube,
    },
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
