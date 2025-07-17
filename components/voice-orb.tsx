"use client"

import { motion } from "framer-motion"

// Custom Voice Orb Component for Sera with flowing wave lines
export const VoiceOrb = ({ size = "w-8 h-8", animate = true }: { size?: string; animate?: boolean }) => (
  <div className={`${size} relative flex items-center justify-center`}>
    {/* Outer pulsing ring */}
    {animate && (
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-300/40 to-pink-300/40"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 0.2, 0.6],
        }}
        transition={{
          duration: 3, // Slower animation
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    )}

    {/* Middle ring */}
    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-200/60 to-pink-200/60 backdrop-blur-sm" />

    {/* Inner core with flowing wave lines */}
    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
      {/* Flowing wave visualization */}
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 0 2px rgba(147, 51, 234, 0.3))" }}
        >
          {/* Main flowing wave - adjusted path to span wider */}
          <motion.path
            d="M0,20 Q10,10 20,20 T40,20" // Extended to cover more of the width
            fill="none"
            stroke="url(#waveGradient1)"
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={
              animate
                ? {
                    d: ["M0,20 Q10,10 20,20 T40,20", "M0,20 Q10,30 20,20 T40,20", "M0,20 Q10,10 20,20 T40,20"],
                    opacity: [0.8, 1, 0.8],
                  }
                : {}
            }
            transition={{
              duration: 4, // Slower animation
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          {/* Secondary wave - adjusted path to span wider */}
          <motion.path
            d="M0,20 Q12,15 20,20 T40,20" // Extended to cover more of the width
            fill="none"
            stroke="url(#waveGradient2)"
            strokeWidth="1"
            strokeLinecap="round"
            animate={
              animate
                ? {
                    d: ["M0,20 Q12,15 20,20 T40,20", "M0,20 Q12,25 20,20 T40,20", "M0,20 Q12,15 20,20 T40,20"],
                    opacity: [0.6, 0.8, 0.6],
                  }
                : {}
            }
            transition={{
              duration: 5, // Slower animation
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>
    </div>
  </div>
)
