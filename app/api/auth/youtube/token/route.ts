import { type NextRequest, NextResponse } from "next/server"
import { getYouTubeToken, getYouTubeChannel } from "@/lib/api/youtube"

export async function POST(request: NextRequest) {
  try {
    const { code, codeVerifier } = await request.json()

    if (!code || !codeVerifier) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 })
    }

    // Exchange code for token
    const tokenData = await getYouTubeToken(code, codeVerifier)

    // Get channel info
    const channelInfo = await getYouTubeChannel(tokenData.access_token)

    // Create auth object
    const auth = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || "",
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      channel: {
        id: channelInfo.id,
        title: channelInfo.snippet.title,
        description: channelInfo.snippet.description,
        thumbnailUrl: channelInfo.snippet.thumbnails.default?.url || channelInfo.snippet.thumbnails.medium?.url,
      },
    }

    return NextResponse.json({ auth })
  } catch (error) {
    console.error("Error exchanging code for token:", error)
    return NextResponse.json({ message: "Failed to exchange code for token" }, { status: 500 })
  }
}
