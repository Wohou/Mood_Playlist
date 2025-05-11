import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get the state and code from cookies
  const state = request.cookies.get("youtube_auth_state")?.value
  const code = request.cookies.get("youtube_auth_code")?.value

  if (!state || !code) {
    return NextResponse.redirect(new URL("/?error=Missing+authentication+parameters", request.url))
  }

  // Create a page that will retrieve the code verifier from localStorage and complete the auth
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Completing YouTube Authentication</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1>Completing YouTube Authentication...</h1>
        <script>
          (async function() {
            try {
              // Get the state from the page
              const state = "${state}";
              
              // Get the code verifier from localStorage using the state
              const codeVerifier = localStorage.getItem("youtube_cv_" + state);
              
              if (!codeVerifier) {
                console.error("Code verifier not found for state:", state);
                window.location.href = "/?error=" + encodeURIComponent("Code verifier not found for state: " + state);
                return;
              }
              
              console.log("Retrieved code verifier:", codeVerifier);
              
              // Exchange the code for tokens
              const response = await fetch("/api/auth/youtube/token", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  code: "${code}",
                  codeVerifier: codeVerifier
                })
              });
              
              const responseText = await response.text();
              console.log("Token response:", responseText);
              
              if (!response.ok) {
                let errorMessage = "Failed to exchange code for token";
                try {
                  const errorData = JSON.parse(responseText);
                  errorMessage = errorData.message || errorMessage;
                } catch (e) {
                  errorMessage = responseText || errorMessage;
                }
                throw new Error(errorMessage);
              }
              
              const data = JSON.parse(responseText);
              
              // Store the auth data in localStorage
              localStorage.setItem("youtube_auth", JSON.stringify(data.auth));
              
              // Clean up
              localStorage.removeItem("youtube_cv_" + state);
              localStorage.removeItem("youtube_auth_state");
              
              // Redirect back to the app
              window.location.href = "/?youtube_auth_success=true";
            } catch (error) {
              console.error("Error completing YouTube auth:", error);
              window.location.href = "/?error=" + encodeURIComponent("Failed to complete YouTube authentication: " + error.message);
            }
          })();
        </script>
      </body>
    </html>
  `

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  })
}
