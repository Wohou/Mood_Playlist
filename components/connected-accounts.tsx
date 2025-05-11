"use client"

import { useAuth } from "@/context/auth-context"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Music, Youtube } from "lucide-react"

export default function ConnectedAccounts() {
  const { t } = useTranslation()
  const { spotify, youtube } = useAuth()

  if (!spotify.isAuthenticated && !youtube.isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{t("connectedAccounts")}</h2>

      {spotify.isAuthenticated && spotify.auth?.user && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Music className="h-5 w-5 mr-2 text-[#1DB954]" />
                Spotify
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              >
                {t("connected")}
              </Badge>
            </div>
            <CardDescription>{t("spotifyAccountConnected")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={spotify.auth.user.imageUrl || "/placeholder.svg"}
                  alt={spotify.auth.user.displayName || ""}
                />
                <AvatarFallback className="bg-[#1DB954] text-white">
                  {spotify.auth.user.displayName?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {spotify.auth.user.displayName || t("spotifyUser")}
                </p>
                <p className="text-sm text-zinc-500">{spotify.auth.user.email || ""}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {youtube.isAuthenticated && youtube.auth?.channel && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Youtube className="h-5 w-5 mr-2 text-[#FF0000]" />
                YouTube
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              >
                {t("connected")}
              </Badge>
            </div>
            <CardDescription>{t("youtubeAccountConnected")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={youtube.auth.channel.thumbnailUrl || "/placeholder.svg"}
                  alt={youtube.auth.channel.title}
                />
                <AvatarFallback className="bg-[#FF0000] text-white">
                  {youtube.auth.channel.title.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{youtube.auth.channel.title}</p>
                <p className="text-sm text-zinc-500 line-clamp-1">{youtube.auth.channel.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
