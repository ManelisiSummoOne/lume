"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Leaf, Cloud, Sun, Heart, Headphones } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MeditationCard } from "@/components/meditation-card"
import { MeditationTimer } from "@/components/meditation-timer"
import { LumeOSFooter } from "@/components/lumeos-footer"
import { VoiceOrb } from "@/components/voice-orb" // Import VoiceOrb

export default function MindfulnessPage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Time-based theme adaptation (copied from app/page.tsx)
  const getTimeBasedGradient = () => {
    const hour = currentTime.getHours()
    if (hour >= 6 && hour < 12) {
      return "from-orange-100 via-pink-50 to-purple-100" // Morning
    } else if (hour >= 12 && hour < 18) {
      return "from-blue-50 via-purple-50 to-pink-100" // Afternoon
    } else {
      return "from-purple-100 via-blue-100 to-indigo-200" // Evening/Night
    }
  }

  // Update time for contextual theming (copied from app/page.tsx)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const meditations = [
    {
      title: "Mindful Breathing",
      description: "Focus on your breath to calm your mind and body, finding stillness within.",
      duration: 5,
      icon: <Leaf className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Body Scan Meditation",
      description: "Systematically bring awareness to different parts of your body to release tension and relax.",
      duration: 10,
      icon: <Cloud className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Loving-Kindness",
      description: "Cultivate feelings of warmth, compassion, and goodwill towards yourself and others.",
      duration: 15,
      icon: <Heart className="w-8 h-8 text-pink-600" />,
    },
    {
      title: "Morning Gratitude",
      description: "Start your day with appreciation, setting positive intentions for the hours ahead.",
      duration: 7,
      icon: <Sun className="w-8 h-8 text-yellow-600" />,
    },
  ]

  const handleStartMeditation = (title: string) => {
    alert(`Starting "${title}" meditation! (Functionality to be implemented)`)
    // In a real app, you would navigate to a meditation player or start audio playback
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getTimeBasedGradient()} relative overflow-hidden pt-24 pb-8`}>
      {/* Enhanced Ambient Background Elements (copied from app/page.tsx) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Floating Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-blue-200/25 to-purple-200/25 rounded-full blur-2xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 25, 0],
            scale: [1, 1.2, 1],
            rotate: [0, -360, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-pink-200/20 to-blue-200/20 rounded-full blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 6,
          }}
        />

        {/* Subtle Geometric Shapes */}
        <motion.div
          className="absolute top-1/4 left-1/3 w-2 h-2 bg-purple-300/40 rounded-full"
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-pink-300/50 rounded-full"
          animate={{
            y: [0, -80, 0],
            x: [0, 20, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 lg:px-8 z-10 relative">
        {/* Hero Section - Copied from app/page.tsx structure */}
        <motion.div
          className="mb-12 text-center max-w-2xl mx-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        >
          {/* Main Headline */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-800 mb-6 leading-tight"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Cultivate Inner{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Peace</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-lg md:text-xl text-gray-600 mb-12 font-light leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Your guide to tranquility and mindful living.
          </motion.p>

          {/* Sera's Enhanced Avatar with Ambient Elements (copied from app/page.tsx) */}
          <div className="relative mb-8">
            {/* Background Ambient Orbs */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.8 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-${32 + i * 16} h-${32 + i * 16} rounded-full`}
                  style={{
                    background: `radial-gradient(circle, ${
                      i === 0
                        ? "rgba(147, 51, 234, 0.1)"
                        : i === 1
                          ? "rgba(236, 72, 153, 0.08)"
                          : "rgba(59, 130, 246, 0.06)"
                    } 0%, transparent 70%)`,
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>

            {/* Central Sera Avatar */}
            <motion.div
              className="relative z-10 w-32 h-32 mx-auto bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 rounded-full flex items-center justify-center shadow-2xl"
              animate={{
                boxShadow: [
                  "0 0 30px rgba(147, 51, 234, 0.3), 0 0 60px rgba(236, 72, 153, 0.2)",
                  "0 0 50px rgba(147, 51, 234, 0.5), 0 0 80px rgba(236, 72, 153, 0.3)",
                  "0 0 30px rgba(147, 51, 234, 0.3), 0 0 60px rgba(236, 72, 153, 0.2)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <VoiceOrb size="w-12 h-12" animate={true} intensity="medium" />
            </motion.div>

            {/* Floating Particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full"
                style={{
                  top: `${30 + Math.sin(i * 45) * 40}%`,
                  left: `${30 + Math.cos(i * 45) * 40}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.sin(i) * 10, 0],
                  opacity: [0.4, 0.8, 0.4],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Meditation Timer Section */}
        <motion.section
          className="mb-16 flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <MeditationTimer initialDuration={900} /> {/* 15 minutes */}
        </motion.section>

        {/* Guided Meditations Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <Headphones className="w-6 h-6 text-purple-600" />
              Guided Meditations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meditations.map((meditation, index) => (
                <MeditationCard
                  key={index}
                  title={meditation.title}
                  description={meditation.description}
                  duration={meditation.duration}
                  icon={meditation.icon}
                  onStart={() => handleStartMeditation(meditation.title)}
                />
              ))}
            </div>
          </Card>
        </motion.section>

        {/* Breathing Exercises Section (Placeholder) */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <Leaf className="w-6 h-6 text-green-600" />
              Breathing Exercises
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Explore various breathing techniques to manage stress and enhance focus. (Content coming soon!)
            </p>
            {/* You can add more MeditationCard components here for specific breathing exercises */}
          </Card>
        </motion.section>
      </div>

      <LumeOSFooter />
    </div>
  )
}
