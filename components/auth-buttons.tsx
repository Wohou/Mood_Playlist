"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/context/auth-context"
import { Loader2, LogOut, Check } from "lucide-react"

export default function AuthButtons() {
  const { t } = useTranslation()
  const { spotify, youtube } = useAuth()

  const handleSpotifyLogin = () => {
    spotify.login()
  }

  const handleYouTubeLogin = () => {
    youtube.login()
  }

  const handleSpotifyLogout = () => {
    spotify.logout()
  }

  const handleYouTubeLogout = () => {
    youtube.logout()
  }

  return (
    <div className="space-y-3">
      {/* Spotify Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        {spotify.isAuthenticated ? (
          <Button
            onClick={handleSpotifyLogout}
            className="w-full bg-[#1DB954] hover:bg-[#1AA34A] text-white"
            size="lg"
            disabled={spotify.isLoading}
          >
            {spotify.isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                {t("disconnectSpotify")}
              </>
            )}
            <LogOut className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSpotifyLogin}
            className="w-full bg-[#1DB954] hover:bg-[#1AA34A] text-white"
            size="lg"
            disabled={spotify.isLoading}
          >
            {spotify.isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM16.5917 16.5917C16.2931 16.8903 15.8162 16.8903 15.5176 16.5917C14.3768 15.5498 12.7218 14.9612 11.0669 14.9612C9.56184 14.9612 8.20553 15.2598 7.06472 15.8485C6.61784 16.0478 6.14101 15.8485 5.94167 15.4016C5.74234 14.9547 5.94167 14.4779 6.38856 14.2786C7.82695 13.5407 9.41202 13.2421 11.0669 13.2421C13.1208 13.2421 15.1746 13.9799 16.6131 15.3183C16.9117 15.6169 16.9117 16.0937 16.5917 16.5917ZM17.9301 13.6896C17.5324 14.0873 16.8945 14.0873 16.4969 13.6896C15.0585 12.3512 12.8553 11.5641 10.3532 11.5641C8.59828 11.5641 7.04316 11.9618 5.78473 12.6996C5.28691 12.9983 4.64895 12.7989 4.35029 12.3512C4.05162 11.8534 4.25095 11.2154 4.69784 10.9168C6.25296 10.0304 8.10721 9.53261 10.4525 9.53261C13.4194 9.53261 16.0969 10.5179 17.9301 12.2521C18.2288 12.6498 18.2288 13.2877 17.9301 13.6896ZM19.2685 10.5179C18.7707 10.9156 18.0335 10.9156 17.6358 10.5179C15.9015 8.88435 12.9346 7.89913 9.76857 7.89913C7.71472 7.89913 5.76114 8.29695 4.10681 9.03424C3.60899 9.23358 3.07123 8.93491 2.8719 8.43709C2.67256 7.93927 2.97123 7.40151 3.46905 7.20218C5.36169 6.36577 7.61505 5.86795 9.86824 5.86795C13.5187 5.86795 16.9834 7.05209 19.0372 9.03424C19.4349 9.43206 19.4349 10.1694 19.2685 10.5179Z" />
              </svg>
            )}
            {t("connectSpotify")}
          </Button>
        )}
      </motion.div>

      {/* YouTube Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        {youtube.isAuthenticated ? (
          <Button
            onClick={handleYouTubeLogout}
            className="w-full bg-[#FF0000] hover:bg-[#CC0000] text-white"
            size="lg"
            disabled={youtube.isLoading}
          >
            {youtube.isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                {t("disconnectYouTube")}
              </>
            )}
            <LogOut className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleYouTubeLogin}
            className="w-full bg-[#FF0000] hover:bg-[#CC0000] text-white"
            size="lg"
            disabled={youtube.isLoading}
          >
            {youtube.isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            )}
            {t("connectYouTube")}
          </Button>
        )}
      </motion.div>

      {/* Error Messages */}
      {spotify.error && <p className="text-sm text-red-500 mt-1">{spotify.error}</p>}
      {youtube.error && <p className="text-sm text-red-500 mt-1">{youtube.error}</p>}
    </div>
  )
}
