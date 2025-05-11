"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Edit2, Trash2, Check, X } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SectionHeaderProps {
  id: string
  title: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  onRename: (newTitle: string) => void
  onDelete: () => void
}

export default function SectionHeader({
  id,
  title,
  isCollapsed,
  onToggleCollapse,
  onRename,
  onDelete,
}: SectionHeaderProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [newTitle, setNewTitle] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  // Set up sortable for drag and drop
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: {
      type: "section",
      id,
    },
  })

  // Apply transform styles for drag movement
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Handle save of new title
  const handleSave = () => {
    if (newTitle.trim()) {
      onRename(newTitle.trim())
      setIsEditing(false)
    }
  }

  // Handle cancel of editing
  const handleCancel = () => {
    setNewTitle(title)
    setIsEditing(false)
  }

  // Handle key press in input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-2 ${
        isDragging ? "shadow-lg" : ""
      }`}
      {...attributes}
    >
      <div className="flex items-center flex-grow">
        <div
          className="cursor-grab active:cursor-grabbing mr-2 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
          {...listeners}
        >
          <div className="w-4 h-4 flex flex-col items-center justify-center gap-1">
            <div className="w-4 h-0.5 bg-zinc-400 dark:bg-zinc-500 rounded-full"></div>
            <div className="w-4 h-0.5 bg-zinc-400 dark:bg-zinc-500 rounded-full"></div>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center flex-grow">
            <Input
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 py-1"
              placeholder={t("sectionTitle")}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 ml-1 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
              onClick={handleSave}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <h3 className="font-medium text-zinc-800 dark:text-zinc-200">{title}</h3>
        )}
      </div>

      <div className="flex items-center">
        {!isEditing && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              onClick={() => setIsEditing(true)}
              aria-label={t("renameSection")}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
              onClick={onDelete}
              aria-label={t("deleteSection")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? t("expandSection") : t("collapseSection")}
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
