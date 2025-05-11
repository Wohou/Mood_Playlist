import { z } from "zod"

// Spotify API endpoints
const SPOTIFY_API_BASE = "https://api.spotify.com/v1"
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

// Spotify scopes needed for our application
const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
  "user-library-modify",
  "user-top-read",
]

// Environment variables (to be set in .env.local)
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || ""
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ""
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/spotify/callback`

// Generate a random string for PKCE
export function generateRandomString(length: number): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const values = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join("")
}

// Generate code challenge for PKCE
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest("SHA-256", data)

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

// Get Spotify authorization URL
export function getSpotifyAuthUrl(): { url: string; codeVerifier: string } {
  const codeVerifier = generateRandomString(64)

  // Store code verifier in localStorage for later verification
  if (typeof window !== "undefined") {
    localStorage.setItem("spotify_code_verifier", codeVerifier)
  }

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SPOTIFY_SCOPES.join(" "),
    state: generateRandomString(16),
    code_challenge_method: "S256",
    code_challenge: codeVerifier, // In a real implementation, this should be hashed
  })

  return {
    url: `${SPOTIFY_AUTH_URL}?${params.toString()}`,
    codeVerifier,
  }
}

// Spotify token response schema
const SpotifyTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string(),
})

type SpotifyToken = z.infer<typeof SpotifyTokenSchema>

// Exchange authorization code for access token
export async function getSpotifyToken(code: string, codeVerifier: string): Promise<SpotifyToken> {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  })

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || "Failed to get Spotify token")
  }

  const data = await response.json()
  return SpotifyTokenSchema.parse(data)
}

// Refresh access token
export async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyToken> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: SPOTIFY_CLIENT_ID,
  })

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || "Failed to refresh Spotify token")
  }

  const data = await response.json()
  return SpotifyTokenSchema.parse(data)
}

// Spotify user profile schema
const SpotifyUserSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  email: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
      }),
    )
    .optional(),
  product: z.string().optional(),
})

export type SpotifyUser = z.infer<typeof SpotifyUserSchema>

// Get user profile
export async function getSpotifyUserProfile(accessToken: string): Promise<SpotifyUser> {
  const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to get Spotify user profile")
  }

  const data = await response.json()
  return SpotifyUserSchema.parse(data)
}

// Spotify playlist schema
const SpotifyPlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  images: z.array(
    z.object({
      url: z.string(),
    }),
  ),
  tracks: z.object({
    total: z.number(),
  }),
})

export type SpotifyPlaylist = z.infer<typeof SpotifyPlaylistSchema>

// Get user playlists
export async function getSpotifyUserPlaylists(accessToken: string): Promise<SpotifyPlaylist[]> {
  const response = await fetch(`${SPOTIFY_API_BASE}/me/playlists?limit=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to get Spotify playlists")
  }

  const data = await response.json()
  return z.array(SpotifyPlaylistSchema).parse(data.items)
}

// Create a new playlist
export async function createSpotifyPlaylist(
  accessToken: string,
  userId: string,
  name: string,
  description: string,
  isPublic = false,
): Promise<SpotifyPlaylist> {
  const response = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      public: isPublic,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to create Spotify playlist")
  }

  const data = await response.json()
  return SpotifyPlaylistSchema.parse(data)
}

// Add tracks to a playlist
export async function addTracksToSpotifyPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[],
): Promise<void> {
  const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: trackUris,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to add tracks to Spotify playlist")
  }
}

// Search for tracks
export async function searchSpotifyTracks(accessToken: string, query: string): Promise<any> {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "10",
  })

  const response = await fetch(`${SPOTIFY_API_BASE}/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to search Spotify tracks")
  }

  return response.json()
}
