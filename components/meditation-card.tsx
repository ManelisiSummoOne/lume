"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Play, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface MeditationCardProps {
  title: string
  description: string
  duration: number // duration in minutes
  icon: React.ReactNode // Lucide icon component
  onStart: () => void
}

export function MeditationCard({ title, description, duration, icon, onStart }: MeditationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      className="w-full"
    >
      <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <div className="flex-grow text-left">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>{duration} min</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 transition-all duration-300"
          onClick={onStart}
          aria-label={`Start ${title} meditation`}
        >
          <Play className="w-5 h-5" />
        </Button>
      </Card>
    </motion.div>
  )
}
