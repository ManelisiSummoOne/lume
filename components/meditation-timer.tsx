"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface MeditationTimerProps {
  initialDuration?: number // in seconds
}

export function MeditationTimer({ initialDuration = 600 }: MeditationTimerProps) {
  const [time, setTime] = useState(initialDuration)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate progress for the SVG circle
  const circumference = 2 * Math.PI * 90 // 90 is the radius
  const progress = (time / initialDuration) * circumference
  const strokeDashoffset = circumference - progress

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(intervalRef.current!)
            setIsRunning(false)
            // Optionally trigger a notification or sound when timer finishes
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, initialDuration])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleStartPause = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTime(initialDuration)
  }

  return (
    <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-6 rounded-2xl shadow-lg text-center relative overflow-hidden">
      {/* Subtle background gradient animation */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-100/20 to-pink-100/20"
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <div className="relative z-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Meditation Timer</h3>
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              className="text-gray-200/50"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="90"
              cx="100"
              cy="100"
            />
            <motion.circle
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r="90"
              cx="100"
              cy="100"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeDashoffset }}
              transition={{ duration: 1, ease: "linear" }}
              // Use a gradient for the stroke
              stroke="url(#timerGradient)"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" /> {/* Purple */}
                <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-6xl font-bold text-purple-700 tabular-nums"
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeOut" }}
            >
              {formatTime(time)}
            </motion.div>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleStartPause}
            className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6 py-3 shadow-md transition-all duration-300"
          >
            {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="bg-white/50 hover:bg-white/70 text-gray-700 rounded-full px-6 py-3 border-white/60 shadow-md transition-all duration-300"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  )
}
