"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { usePlaylist } from "@/context/playlist-context"
import { useTranslation } from "@/lib/i18n"

export default function GenerateButton() {
  const { t } = useTranslation()
  const { isGenerating, generatePlaylist } = usePlaylist()

  return (
    <div className="pt-2">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={generatePlaylist}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-6"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t("generating")}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              {t("generatePlaylist")}
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
