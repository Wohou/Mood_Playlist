import { z } from "zod"

// YouTube API endpoints
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"
const YOUTUBE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token"

// YouTube scopes needed for our application
const YOUTUBE_SCOPES = ["https://www.googleapis.com/auth/youtube.readonly", "https://www.googleapis.com/auth/youtube"]

// Environment variables (to be set in .env.local)
const YOUTUBE_CLIENT_ID = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || ""
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || ""
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/youtube/callback`

// Generate a random string for state
export function generateRandomString(length: number): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const values = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join("")
}

// Generate code challenge for PKCE
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  // Convert the code verifier to a Uint8Array
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)

  // Generate the SHA-256 hash
  const digest = await crypto.subtle.digest("SHA-256", data)

  // Convert the hash to a base64url string
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

// Get YouTube authorization URL
export async function getYouTubeAuthUrl(): Promise<{ url: string; codeVerifier: string; state: string }> {
  const codeVerifier = generateRandomString(64)
  const state = generateRandomString(16)

  // Generate code challenge from verifier
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  console.log("Generated code verifier:", codeVerifier)
  console.log("Generated code challenge:", codeChallenge)

  // Store code verifier in localStorage with state as key
  if (typeof window !== "undefined") {
    // Store the code verifier with the state as the key
    localStorage.setItem(`youtube_cv_${state}`, codeVerifier)

    // Also store the state itself for verification
    localStorage.setItem("youtube_auth_state", state)
  }

  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: YOUTUBE_SCOPES.join(" "),
    access_type: "offline",
    state: state,
    prompt: "consent",
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  })

  return {
    url: `${YOUTUBE_AUTH_URL}?${params.toString()}`,
    codeVerifier,
    state,
  }
}

// YouTube token response schema
const YouTubeTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string(),
})

type YouTubeToken = z.infer<typeof YouTubeTokenSchema>

// Exchange authorization code for access token
export async function getYouTubeToken(code: string, codeVerifier: string): Promise<YouTubeToken> {
  console.log("Exchanging code for token with verifier:", codeVerifier)

  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    client_secret: YOUTUBE_CLIENT_SECRET,
    code,
    code_verifier: codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
  })

  try {
    const response = await fetch(YOUTUBE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    const responseText = await response.text()
    console.log("Token response:", responseText)

    if (!response.ok) {
      let errorMessage = "Failed to get YouTube token"
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error_description || errorData.error || errorMessage
      } catch (e) {
        // If parsing fails, use the raw response text
        errorMessage = responseText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const data = JSON.parse(responseText)
    return YouTubeTokenSchema.parse(data)
  } catch (error) {
    console.error("Error in getYouTubeToken:", error)
    throw error
  }
}

// Refresh access token
export async function refreshYouTubeToken(refreshToken: string): Promise<YouTubeToken> {
  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    client_secret: YOUTUBE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  })

  const response = await fetch(YOUTUBE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || "Failed to refresh YouTube token")
  }

  const data = await response.json()
  return YouTubeTokenSchema.parse(data)
}

// YouTube channel schema
const YouTubeChannelSchema = z.object({
  id: z.string(),
  snippet: z.object({
    title: z.string(),
    description: z.string(),
    thumbnails: z.object({
      default: z
        .object({
          url: z.string(),
        })
        .optional(),
      medium: z
        .object({
          url: z.string(),
        })
        .optional(),
      high: z
        .object({
          url: z.string(),
        })
        .optional(),
    }),
  }),
})

export type YouTubeChannel = z.infer<typeof YouTubeChannelSchema>

// Get user channel
export async function getYouTubeChannel(accessToken: string): Promise<YouTubeChannel> {
  const params = new URLSearchParams({
    part: "snippet",
    mine: "true",
  })

  const response = await fetch(`${YOUTUBE_API_BASE}/channels?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to get YouTube channel")
  }

  const data = await response.json()
  if (!data.items || data.items.length === 0) {
    throw new Error("No YouTube channel found")
  }

  return YouTubeChannelSchema.parse(data.items[0])
}

// YouTube playlist schema
const YouTubePlaylistSchema = z.object({
  id: z.string(),
  snippet: z.object({
    title: z.string(),
    description: z.string(),
    thumbnails: z.object({
      default: z
        .object({
          url: z.string(),
        })
        .optional(),
      medium: z
        .object({
          url: z.string(),
        })
        .optional(),
      high: z
        .object({
          url: z.string(),
        })
        .optional(),
    }),
  }),
  contentDetails: z.object({
    itemCount: z.number(),
  }),
})

export type YouTubePlaylist = z.infer<typeof YouTubePlaylistSchema>

// Get user playlists
export async function getYouTubePlaylists(accessToken: string): Promise<YouTubePlaylist[]> {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    mine: "true",
    maxResults: "50",
  })

  const response = await fetch(`${YOUTUBE_API_BASE}/playlists?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to get YouTube playlists")
  }

  const data = await response.json()
  return z.array(YouTubePlaylistSchema).parse(data.items || [])
}

// Create a new playlist
export async function createYouTubePlaylist(
  accessToken: string,
  title: string,
  description: string,
  isPrivate = true,
): Promise<YouTubePlaylist> {
  const response = await fetch(`${YOUTUBE_API_BASE}/playlists?part=snippet,status`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      snippet: {
        title,
        description,
      },
      status: {
        privacyStatus: isPrivate ? "private" : "public",
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to create YouTube playlist")
  }

  const data = await response.json()
  return YouTubePlaylistSchema.parse(data)
}

// Add video to a playlist
export async function addVideoToYouTubePlaylist(
  accessToken: string,
  playlistId: string,
  videoId: string,
): Promise<void> {
  const response = await fetch(`${YOUTUBE_API_BASE}/playlistItems?part=snippet`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      snippet: {
        playlistId,
        resourceId: {
          kind: "youtube#video",
          videoId,
        },
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to add video to YouTube playlist")
  }
}

// Search for videos
export async function searchYouTubeVideos(accessToken: string, query: string): Promise<any> {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "10",
  })

  const response = await fetch(`${YOUTUBE_API_BASE}/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to search YouTube videos")
  }

  return response.json()
}
