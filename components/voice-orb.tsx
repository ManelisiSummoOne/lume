"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

interface VoiceOrbProps {
  size?: string
  animate?: boolean
  intensity?: "low" | "medium" | "high"
  isListening?: boolean
  isSpeaking?: boolean
}

// Enhanced Sera Orb with beautiful animations and particle effects
export const VoiceOrb = ({ 
  size = "w-8 h-8", 
  animate = true, 
  intensity = "medium",
  isListening = false,
  isSpeaking = false
}: VoiceOrbProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  // Generate floating particles around the orb
  useEffect(() => {
    if (animate) {
      const particleCount = intensity === "high" ? 12 : intensity === "medium" ? 8 : 4
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      }))
      setParticles(newParticles)
    }
  }, [animate, intensity])

  // Dynamic colors based on state
  const getOrbColors = () => {
    if (isSpeaking) return {
      outer: "from-emerald-400 via-teal-400 to-cyan-400",
      middle: "from-emerald-300/80 via-teal-300/80 to-cyan-300/80",
      inner: "from-emerald-100 via-teal-50 to-cyan-100",
      glow: "emerald-400",
      particles: "emerald"
    }
    if (isListening) return {
      outer: "from-orange-400 via-amber-400 to-yellow-400",
      middle: "from-orange-300/80 via-amber-300/80 to-yellow-300/80", 
      inner: "from-orange-100 via-amber-50 to-yellow-100",
      glow: "orange-400",
      particles: "orange"
    }
    return {
      outer: "from-purple-400 via-violet-400 to-pink-400",
      middle: "from-purple-300/80 via-violet-300/80 to-pink-300/80",
      inner: "from-purple-100 via-violet-50 to-pink-100", 
      glow: "purple-400",
      particles: "purple"
    }
  }

  const colors = getOrbColors()
  const intensityMultiplier = intensity === "high" ? 1.5 : intensity === "medium" ? 1 : 0.7

  return (
    <div className={`${size} relative flex items-center justify-center`}>
      {/* Floating particles around the orb */}
      <AnimatePresence>
        {animate && particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute w-1 h-1 rounded-full bg-${colors.particles}-300 opacity-60`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              x: [0, Math.sin(particle.id) * 10, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + particle.delay,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Outermost ethereal glow */}
      {animate && (
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.outer} opacity-20 blur-md`}
          animate={{
            scale: [1, 1.6 * intensityMultiplier, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Outer pulsing energy ring */}
      {animate && (
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-radial ${colors.outer} opacity-40`}
          animate={{
            scale: [1, 1.4 * intensityMultiplier, 1],
            opacity: [0.2, 0.6, 0.2],
            rotate: 360,
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Secondary energy ring */}
      {animate && (
        <motion.div
          className={`absolute inset-1 rounded-full bg-gradient-conic ${colors.middle} opacity-60`}
          animate={{
            scale: [1, 1.2 * intensityMultiplier, 1],
            rotate: -360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* Middle crystalline layer */}
      <motion.div 
        className={`absolute inset-2 rounded-full bg-gradient-to-br ${colors.middle} backdrop-blur-sm border border-white/20 shadow-inner`}
        animate={animate ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner core with dynamic energy patterns */}
      <div className={`absolute inset-3 rounded-full bg-gradient-to-br ${colors.inner} flex items-center justify-center overflow-hidden shadow-lg`}>
        {/* Dynamic energy visualization */}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 50 50"
            className="w-full h-full"
            style={{ 
              filter: `drop-shadow(0 0 4px rgba(139, 92, 246, 0.4))`,
            }}
          >
            {/* Define advanced gradients */}
            <defs>
              <radialGradient id="energyGradient1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
              </radialGradient>
              <radialGradient id="energyGradient2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#f472b6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f9a8d4" stopOpacity="0.3" />
              </radialGradient>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Central energy core */}
            <motion.circle
              cx="25"
              cy="25"
              r="3"
              fill="url(#energyGradient1)"
              animate={animate ? {
                r: [2, 4, 2],
                opacity: [0.6, 1, 0.6],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Flowing energy waves */}
            {[...Array(3)].map((_, i) => (
              <motion.path
                key={i}
                d={`M5,${25 + i * 2} Q15,${15 + i * 3} 25,${25 + i * 2} T45,${25 + i * 2}`}
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7"
                animate={animate ? {
                  d: [
                    `M5,${25 + i * 2} Q15,${15 + i * 3} 25,${25 + i * 2} T45,${25 + i * 2}`,
                    `M5,${25 + i * 2} Q15,${35 - i * 3} 25,${25 + i * 2} T45,${25 + i * 2}`,
                    `M5,${25 + i * 2} Q15,${15 + i * 3} 25,${25 + i * 2} T45,${25 + i * 2}`,
                  ],
                  opacity: [0.4, 0.8, 0.4],
                } : {}}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}

            {/* Orbital energy rings */}
            {[...Array(2)].map((_, i) => (
              <motion.circle
                key={`orbit-${i}`}
                cx="25"
                cy="25"
                r={8 + i * 4}
                fill="none"
                stroke={`url(#energyGradient${i + 1})`}
                strokeWidth="0.5"
                strokeDasharray="2,2"
                animate={animate ? {
                  rotate: i % 2 === 0 ? 360 : -360,
                  opacity: [0.3, 0.7, 0.3],
                } : {}}
                transition={{
                  duration: 10 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ originX: "25px", originY: "25px" }}
              />
            ))}

            {/* Dynamic energy pulses */}
            {animate && [...Array(6)].map((_, i) => (
              <motion.circle
                key={`pulse-${i}`}
                cx="25"
                cy="25"
                r="1"
                fill={`url(#energyGradient${(i % 2) + 1})`}
                animate={{
                  r: [0, 15, 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: "easeOut",
                }}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Ambient glow overlay */}
      {animate && (
        <motion.div
          className={`absolute inset-0 rounded-full bg-${colors.glow} opacity-10 blur-xl`}
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  )
}
