import { type NextRequest, NextResponse } from "next/server"
import { getSpotifyToken, getSpotifyUserProfile } from "@/lib/api/spotify"

export async function GET(request: NextRequest) {
  // Get the authorization code from the URL
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  // Handle errors from Spotify
  if (error) {
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(`Spotify auth error: ${error}`)}`, request.url))
  }

  // Ensure we have a code
  if (!code) {
    return NextResponse.redirect(new URL("/?error=No+authorization+code+received+from+Spotify", request.url))
  }

  try {
    // Get code verifier from cookie
    const codeVerifier = request.cookies.get("spotify_code_verifier")?.value

    if (!codeVerifier) {
      return NextResponse.redirect(new URL("/?error=Missing+code+verifier+for+Spotify+authentication", request.url))
    }

    // Exchange code for token
    const tokenData = await getSpotifyToken(code, codeVerifier)

    // Get user profile
    const userProfile = await getSpotifyUserProfile(tokenData.access_token)

    // Create auth object
    const auth = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || "",
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      user: {
        id: userProfile.id,
        displayName: userProfile.display_name,
        email: userProfile.email,
        imageUrl: userProfile.images?.[0]?.url,
      },
    }

    // Redirect back to the app with success
    const redirectUrl = new URL("/?spotify_auth_success=true", request.url)

    // Create a response with the auth data in a cookie
    const response = NextResponse.redirect(redirectUrl)

    // Set auth data in a cookie (in a real app, you'd use a more secure method)
    response.cookies.set("spotify_auth", JSON.stringify(auth), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error in Spotify callback:", error)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent("Failed to authenticate with Spotify")}`, request.url),
    )
  }
}
