"use client"

import { motion } from "framer-motion"
import { Leaf, Wind, Cloud, Sun, Smile } from "lucide-react"
import { Card } from "@/components/ui/card"

interface MoodCheckCircleProps {
  dominantMood: string
}

const MoodIcon = ({ mood, size = "w-10 h-10" }: { mood: string; size?: string }) => {
  const iconMap = {
    calm: <Leaf className={`${size} text-green-500`} />,
    anxious: <Wind className={`${size} text-gray-500`} />,
    sad: <Cloud className={`${size} text-blue-500`} />,
    hopeful: <Sun className={`${size} text-yellow-500`} />,
    default: <Smile className={`${size} text-purple-500`} />,
  }
  return iconMap[mood as keyof typeof iconMap] || iconMap.default
}

export function MoodCheckCircle({ dominantMood }: MoodCheckCircleProps) {
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "calm":
        return "from-green-200 to-green-100"
      case "anxious":
        return "from-gray-200 to-gray-100"
      case "sad":
        return "from-blue-200 to-blue-100"
      case "hopeful":
        return "from-yellow-200 to-yellow-100"
      default:
        return "from-purple-200 to-pink-200"
    }
  }

  return (
    <Card className="relative w-64 h-64 rounded-full flex items-center justify-center bg-white/50 backdrop-blur-md border border-white/40 shadow-xl overflow-hidden">
      {/* Inner glowing circle */}
      <motion.div
        className={`absolute inset-4 rounded-full bg-gradient-to-br ${getMoodColor(dominantMood)} flex flex-col items-center justify-center`}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 20px rgba(147, 51, 234, 0.2)",
            "0 0 30px rgba(147, 51, 234, 0.4)",
            "0 0 20px rgba(147, 51, 234, 0.2)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <MoodIcon mood={dominantMood} size="w-16 h-16" />
        <p className="mt-4 text-xl font-semibold text-gray-800 capitalize">
          {dominantMood === "default" ? "How are you?" : dominantMood}
        </p>
        <p className="text-sm text-gray-600">Current State</p>
      </motion.div>
    </Card>
  )
}
