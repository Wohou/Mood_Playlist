import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get the authorization code and state from the URL
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // Handle errors from YouTube
  if (error) {
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(`YouTube auth error: ${error}`)}`, request.url))
  }

  // Ensure we have a code and state
  if (!code) {
    return NextResponse.redirect(new URL("/?error=No+authorization+code+received+from+YouTube", request.url))
  }

  if (!state) {
    return NextResponse.redirect(new URL("/?error=Missing+state+parameter+from+YouTube", request.url))
  }

  try {
    // We need to pass the state and code to the client-side to retrieve the code verifier
    // Create a temporary cookie with the state and code
    const response = NextResponse.redirect(
      new URL(`/api/auth/youtube/complete?state=${state}&code=${code}`, request.url),
    )

    // Set temporary cookies with the state and code
    response.cookies.set("youtube_auth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 5, // 5 minutes
      path: "/",
    })

    response.cookies.set("youtube_auth_code", code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 5, // 5 minutes
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error in YouTube callback:", error)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent("Failed to authenticate with YouTube")}`, request.url),
    )
  }
}
