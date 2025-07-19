"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  Send,
  Type,
  Volume2,
  VolumeX,
  TrendingUp,
  Target,
  Leaf,
  Wind,
  Cloud,
  Sun,
  FileText,
  Sparkles,
  Heart,
  Eye,
  Hand,
  Ear,
  SnailIcon as Nose,
  Utensils,
  Square,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { LumeOSFooter } from "../components/lumeos-footer"
import { WaitlistDialog } from "../components/waitlist-dialog"
import { MoodCheckCircle } from "../components/mood-check-circle"
import { playAudioStream } from "../utils/audio" // Import audio utility
import { VoiceOrb } from "../components/voice-orb" // Import VoiceOrb
import { MoodSelectorPopup } from "../components/mood-selector-popup"
import { saveMoodEntry } from "../actions/mood"

// Mood icon component
const MoodIcon = ({ mood, size = "w-5 h-5" }: { mood: string; size?: string }) => {
  const iconMap = {
    calm: <Leaf className={`${size} text-green-500`} />,
    anxious: <Wind className={`${size} text-gray-500`} />,
    sad: <Cloud className={`${size} text-blue-500`} />,
    hopeful: <Sun className={`${size} text-yellow-500`} />,
  }

  return iconMap[mood as keyof typeof iconMap] || <Leaf className={`${size} text-green-500`} />
}

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface ConversationInsight {
  averageMood: number
  moodDistribution: { [key: string]: number }
  totalMessages: number
  conversationLength: number
  dominantMood: string
}

export default function LumeOSInterface() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice")
  const [responseMode, setResponseMode] = useState<"text" | "voice">("text")
  const [textInput, setTextInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi, I'm Sera. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [showBreathing, setShowBreathing] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false)
  const [showGrounding, setShowGrounding] = useState(false)
  const [groundingStep, setGroundingStep] = useState(0) // New state for grounding steps
  const [showVoiceSelector, setShowVoiceSelector] = useState(true) // Add this new state
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [userMood, setUserMood] = useState<{ mood: string; intensity: number } | null>(null)
  const [voiceMode, setVoiceMode] = useState<"push-to-talk" | "voice-activation" | "continuous">("voice-activation")
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isPlayingIntroduction, setIsPlayingIntroduction] = useState(false)
  const [hasPlayedIntroduction, setHasPlayedIntroduction] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const groundingTimerRef = useRef<NodeJS.Timeout | null>(null) // Ref for grounding auto-advance
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const silenceDetectionRef = useRef<boolean>(false)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  // Define grounding exercise steps content
  const groundingStepsContent = [
    {
      number: null,
      icon: null,
      title: "Grounding Technique",
      description: "Focus on your senses to bring yourself back to the present moment.",
      buttonText: "Start",
      color: "text-gray-800",
    },
    {
      number: 5,
      icon: <Eye className="w-16 h-16 text-purple-600" />,
      title: "5 things you can SEE",
      description: "Look around and notice five distinct objects or details in your environment.",
      buttonText: "Next",
      color: "text-purple-600",
    },
    {
      number: 4,
      icon: <Hand className="w-16 h-16 text-pink-600" />,
      title: "4 things you can TOUCH",
      description: "Identify four different textures or sensations you can feel right now.",
      buttonText: "Next",
      color: "text-pink-600",
    },
    {
      number: 3,
      icon: <Ear className="w-16 h-16 text-blue-600" />,
      title: "3 things you can HEAR",
      description: "Listen carefully and identify three sounds, near or far.",
      buttonText: "Next",
      color: "text-blue-600",
    },
    {
      number: 2,
      icon: <Nose className="w-16 h-16 text-green-600" />, // Changed icon to Nose
      title: "2 things you can SMELL",
      description: "Notice two distinct scents around you, even subtle ones.",
      buttonText: "Next",
      color: "text-green-600",
    },
    {
      number: 1,
      icon: <Utensils className="w-16 h-16 text-yellow-600" />, // Or a custom icon for taste
      title: "1 thing you can TASTE",
      description: "Pay attention to any taste in your mouth, or imagine a favorite taste.",
      buttonText: "Complete",
      color: "text-yellow-600",
    },
    {
      number: null,
      icon: null,
      title: "Exercise Complete!",
      description: "You've successfully completed the grounding exercise. Take a deep breath and notice how you feel.",
      buttonText: "Close",
      color: "text-gray-800",
    },
  ]

  // Calculate conversation insights in real-time
  const getConversationInsights = (): ConversationInsight => {
    const userMessages = messages.filter((m) => m.isUser)
    const moodDistribution = { calm: 0, anxious: 0, sad: 0, hopeful: 0 }

    // Analyze user messages for mood (simplified sentiment analysis)
    userMessages.forEach((message) => {
      const text = message.text.toLowerCase()
      if (
        text.includes("overwhelmed") ||
        text.includes("stressed") ||
        text.includes("anxious") ||
        text.includes("worried")
      ) {
        moodDistribution.anxious++
      } else if (
        text.includes("sad") ||
        text.includes("down") ||
        text.includes("depressed") ||
        text.includes("upset")
      ) {
        moodDistribution.sad++
      } else if (
        text.includes("better") ||
        text.includes("good") ||
        text.includes("hopeful") ||
        text.includes("positive")
      ) {
        moodDistribution.hopeful++
      } else {
        moodDistribution.calm++
      }
    })

    const totalMoodEntries = Object.values(moodDistribution).reduce((a, b) => a + b, 0)
    const averageMood =
      totalMoodEntries > 0
        ? (moodDistribution.hopeful * 8 +
            moodDistribution.calm * 6 +
            moodDistribution.sad * 3 +
            moodDistribution.anxious * 2) /
          totalMoodEntries
        : 6

    const dominantMood = Object.entries(moodDistribution).reduce((a, b) =>
      moodDistribution[a[0] as keyof typeof moodDistribution] > moodDistribution[b[0] as keyof typeof moodDistribution]
        ? a
        : b,
    )[0]

    return {
      averageMood,
      moodDistribution,
      totalMessages: messages.length,
      conversationLength: Math.floor((Date.now() - messages[0].timestamp.getTime()) / 60000),
      dominantMood: userMood ? userMood.mood : totalMoodEntries > 0 ? dominantMood : "calm",
    }
  }

  const conversationInsights = getConversationInsights()

  // Update time for contextual theming
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Recording duration timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      setRecordingDuration(0)
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [isRecording])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  // Breathing animation cycle
  useEffect(() => {
    if (!showBreathing) return

    const breathingCycle = () => {
      setBreathingPhase("inhale")
      setTimeout(() => setBreathingPhase("hold"), 4000)
      setTimeout(() => setBreathingPhase("exhale"), 7000)
      setTimeout(() => setBreathingPhase("inhale"), 15000)
    }

    breathingCycle()
    const interval = setInterval(breathingCycle, 15000)
    return () => clearInterval(interval)
  }, [showBreathing])

  // Time-based theme adaptation
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

  const getDynamicGreeting = () => {
    const hour = currentTime.getHours()
    if (hour >= 5 && hour < 12) {
      return "Good morning"
    } else if (hour >= 12 && hour < 18) {
      return "Good afternoon"
    } else if (hour >= 18 && hour < 22) {
      return "Good evening"
    } else {
      return "Hello"
    }
  }

  // Voice activity detection
  const detectVoiceActivity = (stream: MediaStream) => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    const source = audioContextRef.current.createMediaStreamSource(stream)
    analyserRef.current = audioContextRef.current.createAnalyser()
    analyserRef.current.fftSize = 256
    source.connect(analyserRef.current)

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const checkAudioLevel = () => {
      if (!analyserRef.current || !isRecording) return

      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / bufferLength

      // Detect silence (adjust threshold as needed)
      const silenceThreshold = 10
      const isSilent = average < silenceThreshold

      if (voiceMode === "voice-activation") {
        if (isSilent && !silenceDetectionRef.current) {
          // Start silence timer
          silenceDetectionRef.current = true
          const timer = setTimeout(() => {
            if (isRecording && silenceDetectionRef.current) {
              handleStopRecording()
            }
          }, 2000) // Stop after 2 seconds of silence
          setSilenceTimer(timer)
        } else if (!isSilent && silenceDetectionRef.current) {
          // Cancel silence timer if voice detected again
          silenceDetectionRef.current = false
          if (silenceTimer) {
            clearTimeout(silenceTimer)
            setSilenceTimer(null)
          }
        }
      }

      if (isRecording) {
        requestAnimationFrame(checkAudioLevel)
      }
    }

    checkAudioLevel()
  }

  const processUserInput = async (input: string) => {
    setIsProcessing(true)
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      // Prepare messages for AI SDK (Gemini)
      const aiMessages = messages.map((msg) => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.text,
      }))
      aiMessages.push({ role: "user", content: input }) // Add current user input

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: aiMessages }),
      })

      if (!response.ok) {
        throw new Error(`AI chat API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Failed to get reader from AI chat response.")

      let seraResponseText = ""
      let done = false
      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        const chunk = new TextDecoder().decode(value)
        seraResponseText += chunk
        console.log("Received chunk:", chunk) // For debugging "3.error"

        // Update UI with streamed text
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage && !lastMessage.isUser) {
            // If the last message is Sera's, append to it
            return prev.map((msg, i) => (i === prev.length - 1 ? { ...msg, text: seraResponseText } : msg))
          } else {
            // Otherwise, add a new message for Sera
            return [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                text: seraResponseText,
                isUser: false,
                timestamp: new Date(),
              },
            ]
          }
        })
      }

      setIsProcessing(false)

      // If voice response is enabled, generate and play speech
      if (responseMode === "voice" && seraResponseText) {
        const ttsResponse = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: seraResponseText }),
        })

        if (!ttsResponse.ok || !ttsResponse.body) {
          throw new Error(`TTS API error: ${ttsResponse.statusText}`)
        }
        await playAudioStream(ttsResponse.body)
      }
    } catch (error) {
      console.error("Error processing user input:", error)
      setIsProcessing(false)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I encountered an error. Please try again.",
          isUser: false,
          timestamp: new Date(),
        },
      ])
    }
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const formData = new FormData()
        formData.append("audio", audioBlob, "recording.wav")

        try {
          setIsProcessing(true)
          const response = await fetch("/api/stt", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`STT API error: ${response.statusText}`)
          }

          const data = await response.json()
          if (data.text) {
            processUserInput(data.text)
          } else {
            throw new Error("No text transcribed.")
          }
        } catch (error) {
          console.error("Error during STT:", error)
          setIsProcessing(false)
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              text: "I couldn't understand that. Could you please repeat?",
              isUser: false,
              timestamp: new Date(),
            },
          ])
        }
      }

      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event.error)
        setIsRecording(false)
        setIsProcessing(false)
        alert("Microphone recording error. Please try again.")
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      silenceDetectionRef.current = false

      // Start voice activity detection for voice-activation mode
      if (voiceMode === "voice-activation") {
        detectVoiceActivity(stream)
      }
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setIsRecording(false)
      setIsProcessing(false)
      alert("Please allow microphone access to use voice input.")
    }
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      // Stop all tracks in the media stream to release the microphone
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }
    }

    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Clear silence timer
    if (silenceTimer) {
      clearTimeout(silenceTimer)
      setSilenceTimer(null)
    }
    silenceDetectionRef.current = false
  }

  const handleRecordToggle = async () => {
    if (isRecording) {
      handleStopRecording()
    } else {
      await handleStartRecording()
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (textInput.trim()) {
      processUserInput(textInput)
      setTextInput("")
    }
  }

  const startBreathingExercise = () => {
    setShowBreathing(true)
    const breathingMessage: Message = {
      id: Date.now().toString(),
      text: "Let's breathe together. Follow the gentle rhythm and let your mind settle.",
      isUser: false,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, breathingMessage])
  }

  const handleGroundingTechnique = () => {
    setShowGrounding(true)
    setGroundingStep(0) // Start from the introduction step
    const groundingMessage: Message = {
      id: Date.now().toString(),
      text: "Let's try a grounding technique. Focus on your senses to bring yourself back to the present moment.",
      isUser: false,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, groundingMessage])
  }

  const handleNextGroundingStep = () => {
    if (groundingStep < groundingStepsContent.length - 1) {
      setGroundingStep((prev) => prev + 1)
    } else {
      setShowGrounding(false) // Close after the last step
      setGroundingStep(0) // Reset for next time
    }
  }

  // Auto-advance grounding steps
  useEffect(() => {
    if (showGrounding && groundingStep < groundingStepsContent.length - 1) {
      if (groundingTimerRef.current) {
        clearTimeout(groundingTimerRef.current)
      }
      groundingTimerRef.current = setTimeout(() => {
        handleNextGroundingStep()
      }, 10000) // Auto-advance after 10 seconds
    } else if (groundingTimerRef.current) {
      clearTimeout(groundingTimerRef.current)
    }
    return () => {
      if (groundingTimerRef.current) {
        clearTimeout(groundingTimerRef.current)
      }
    }
  }, [showGrounding, groundingStep]) // Depend on showGrounding and groundingStep

  const handleOpenWaitlist = () => {
    setShowWaitlistDialog(true)
  }

  const handleCloseWaitlist = () => {
    setShowWaitlistDialog(false)
  }

  const handleSuggestedResponse = (response: string) => {
    processUserInput(response)
  }

  const handleMoodSelect = async (mood: string, intensity: number) => {
    setUserMood({ mood, intensity })

    // Save to database
    try {
      const result = await saveMoodEntry(mood, intensity)
      if (result.success) {
        console.log("Mood saved successfully:", result.data)
        // Add a message from Sera acknowledging the mood
        const moodMessage: Message = {
          id: Date.now().toString(),
          text: `Thank you for sharing that you're feeling ${mood}. I'll keep this in mind as we talk. How can I support you today?`,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, moodMessage])
      }
    } catch (error) {
      console.error("Error saving mood:", error)
    }
  }

  const handleVoiceSelectorClose = async () => {
    setShowVoiceSelector(false)
    
    // If voice communication was selected and we haven't played the introduction yet, play it
    if (inputMode === "voice" && !hasPlayedIntroduction) {
      setIsPlayingIntroduction(true)
      setHasPlayedIntroduction(true)
      
      try {
        // Play Sera's introduction message
        const introText = "Hi, I'm Sera. How are you feeling today?"
        const ttsResponse = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: introText }),
        })

        if (ttsResponse.ok && ttsResponse.body) {
          await playAudioStream(ttsResponse.body)
        }
        
        setIsPlayingIntroduction(false)
        
        // Show mood selector after introduction is complete with a small delay
        setTimeout(() => {
          setShowMoodSelector(true)
        }, 500)
      } catch (error) {
        console.error("Error playing introduction:", error)
        setIsPlayingIntroduction(false)
        // Still show mood selector if audio fails
        setShowMoodSelector(true)
      }
    } else {
      // If text mode or introduction already played, show mood selector immediately
      setShowMoodSelector(true)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getVoiceModeDescription = () => {
    switch (voiceMode) {
      case "push-to-talk":
        return "Hold to record, release to send"
      case "voice-activation":
        return "Tap to start, stops automatically after silence"
      case "continuous":
        return "Tap to start/stop recording manually"
      default:
        return "Speak to Sera"
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getTimeBasedGradient()} relative overflow-hidden`}>
      {/* Enhanced Ambient Background Elements */}
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
      {/* Floating Navigation - Mobile Optimized */}
      <motion.nav
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/30 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <motion.div className="text-xl font-light text-gray-800 tracking-wide" whileHover={{ scale: 1.05 }}>
              LumeOS
            </motion.div>
            <Button
              variant="ghost"
              className="bg-white/30 hover:bg-white/40 text-gray-700 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap"
              onClick={handleOpenWaitlist}
            >
              Join Waitlist
            </Button>
          </div>
        </div>
      </motion.nav>
      {/* Main Content - Two Panel Layout for Large Screens */}
      <div className="flex flex-col lg:flex-row min-h-screen pt-24 pb-8">
        {/* Left Panel - Sera Chat Interface */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 lg:px-8">
          {/* Enhanced Hero Section */}
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
              {getDynamicGreeting()}, I'm Sera.{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                How are you feeling today?
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="text-lg md:text-xl text-gray-600 mb-12 font-light leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Let's explore your emotional journey together
            </motion.p>

            {/* Sera's Enhanced Avatar with Ambient Elements */}
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
                  boxShadow: isPlayingIntroduction ? [
                    "0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(147, 51, 234, 0.4)",
                    "0 0 60px rgba(59, 130, 246, 0.7), 0 0 100px rgba(147, 51, 234, 0.6)",
                    "0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(147, 51, 234, 0.4)",
                  ] : [
                    "0 0 30px rgba(147, 51, 234, 0.3), 0 0 60px rgba(236, 72, 153, 0.2)",
                    "0 0 50px rgba(147, 51, 234, 0.5), 0 0 80px rgba(236, 72, 153, 0.3)",
                    "0 0 30px rgba(147, 51, 234, 0.3), 0 0 60px rgba(236, 72, 153, 0.2)",
                  ],
                  scale: isPlayingIntroduction ? [1, 1.05, 1] : [1, 1, 1],
                }}
                transition={{
                  duration: isPlayingIntroduction ? 2 : 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <VoiceOrb size="w-12 h-12" animate={true} />
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

          {/* Mood Check Circle & Current State Display */}
          <motion.div
            className="mb-12 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <MoodCheckCircle dominantMood={conversationInsights.dominantMood} />
            <p className="mt-4 text-lg font-medium text-gray-700">
              You seem{" "}
              <span className="font-semibold capitalize text-purple-700">
                {conversationInsights.dominantMood === "default"
                  ? "ready to connect"
                  : conversationInsights.dominantMood}
              </span>{" "}
              today.
            </p>
          </motion.div>

          {/* Voice Mode Selector */}
          {inputMode === "voice" && (
            <motion.div
              className="mb-6 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-4 rounded-2xl">
                <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Voice Input Mode</h4>
                <div className="flex gap-2">
                  <Button
                    variant={voiceMode === "voice-activation" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVoiceMode("voice-activation")}
                    className={`text-xs ${
                      voiceMode === "voice-activation"
                        ? "bg-purple-500 text-white"
                        : "bg-white/50 text-gray-700 hover:bg-white/70"
                    }`}
                  >
                    Smart Stop
                  </Button>
                  <Button
                    variant={voiceMode === "push-to-talk" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVoiceMode("push-to-talk")}
                    className={`text-xs ${
                      voiceMode === "push-to-talk"
                        ? "bg-purple-500 text-white"
                        : "bg-white/50 text-gray-700 hover:bg-white/70"
                    }`}
                  >
                    Hold to Talk
                  </Button>
                  <Button
                    variant={voiceMode === "continuous" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVoiceMode("continuous")}
                    className={`text-xs ${
                      voiceMode === "continuous"
                        ? "bg-purple-500 text-white"
                        : "bg-white/50 text-gray-700 hover:bg-white/70"
                    }`}
                  >
                    Manual
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Input Mode & Response Mode Controls */}
          <motion.div
            className="mb-6 flex flex-col sm:flex-row gap-4 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <Mic className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Voice Input</span>
                <Switch
                  checked={inputMode === "text"}
                  onCheckedChange={(checked) => setInputMode(checked ? "text" : "voice")}
                />
                <Type className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Text Input</span>
              </div>
            </Card>

            <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Voice Response</span>
                <Switch
                  checked={responseMode === "text"}
                  onCheckedChange={(checked) => setResponseMode(checked ? "text" : "voice")}
                />
                <VolumeX className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Text Response</span>
              </div>
            </Card>
          </motion.div>

          {/* Chat Interface */}
          <div ref={messagesContainerRef} className="w-full max-w-md mb-8 max-h-96 overflow-y-auto smooth-scroll">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`mb-4 ${message.isUser ? "flex justify-end" : "flex justify-start"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Sera's Avatar for her messages */}
                  {!message.isUser && (
                    <motion.div
                      className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center mr-3 mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <VoiceOrb size="w-4 h-4" animate={false} />
                    </motion.div>
                  )}

                  <div className="flex flex-col">
                    {/* Message sender label */}
                    {!message.isUser && (
                      <motion.p
                        className="text-xs text-purple-600 font-medium mb-1 ml-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        Sera
                      </motion.p>
                    )}

                    <Card
                      className={`max-w-xs p-4 ${
                        message.isUser
                          ? "bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200/50 ml-8"
                          : "bg-gradient-to-br from-white/80 to-white/60 border-purple-200/30 shadow-lg"
                      } backdrop-blur-sm rounded-3xl ${message.isUser ? "rounded-br-lg" : "rounded-bl-lg"}`}
                    >
                      <motion.p
                        className={`text-sm leading-relaxed ${message.isUser ? "text-purple-800" : "text-gray-800"}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        {message.text}
                      </motion.p>
                    </Card>

                    {/* Timestamp */}
                    <motion.p
                      className={`text-xs text-gray-500 mt-1 ${message.isUser ? "text-right mr-2" : "text-left ml-1"}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </motion.p>
                  </div>

                  {/* User avatar placeholder */}
                  {message.isUser && (
                    <motion.div
                      className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center ml-3 mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Enhanced Typing Indicator */}
            {isProcessing && (
              <motion.div
                className="flex justify-start mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Sera's Avatar for typing indicator */}
                <motion.div
                  className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center mr-3 mt-1"
                  animate={{
                    boxShadow: ["0 0 0 0 rgba(147, 51, 234, 0.4)", "0 0 0 8px rgba(147, 51, 234, 0)"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeOut",
                  }}
                >
                  <VoiceOrb size="w-4 h-4" animate={true} />
                </motion.div>

                <div className="flex flex-col">
                  <p className="text-xs text-purple-600 font-medium mb-1 ml-1">Sera is thinking...</p>
                  <Card className="bg-gradient-to-br from-white/80 to-white/60 border-purple-200/30 shadow-lg backdrop-blur-sm rounded-3xl rounded-bl-lg p-4">
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{
                            y: [0, -8, 0],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </div>

          {/* Suggested Responses */}
          <motion.div
            className="w-full max-w-md mb-8 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button
              variant="outline"
              className="bg-white/40 hover:bg-white/60 text-gray-700 rounded-full px-4 py-2 text-sm border-white/50"
              onClick={() => handleSuggestedResponse("I'm feeling a bit overwhelmed.")}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Overwhelmed
            </Button>
            <Button
              variant="outline"
              className="bg-white/40 hover:bg-white/60 text-gray-700 rounded-full px-4 py-2 text-sm border-white/50"
              onClick={() => handleSuggestedResponse("I need some calm.")}
            >
              <Leaf className="w-4 h-4 mr-2" /> Need Calm
            </Button>
            <Button
              variant="outline"
              className="bg-white/40 hover:bg-white/60 text-gray-700 rounded-full px-4 py-2 text-sm border-white/50"
              onClick={() => handleSuggestedResponse("Tell me something positive.")}
            >
              <Heart className="w-4 h-4 mr-2" /> Positive thought
            </Button>
          </motion.div>

          {/* Enhanced Input Interface */}
          <motion.div
            className="w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {inputMode === "voice" ? (
              <div className="flex flex-col items-center">
                {/* Enhanced Voice Record Button */}
                <div className="relative">
                  {/* Ambient Ripple Effects */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeOut",
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                  </motion.div>

                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.2, 0, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeOut",
                      delay: 0.5,
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                  </motion.div>

                  {/* Main Button */}
                  <motion.button
                    className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${
                      isRecording
                        ? "bg-gradient-to-br from-red-400 to-pink-500"
                        : "bg-gradient-to-br from-purple-400 to-pink-400"
                    }`}
                    onClick={voiceMode === "push-to-talk" ? undefined : handleRecordToggle}
                    onMouseDown={voiceMode === "push-to-talk" ? handleStartRecording : undefined}
                    onMouseUp={voiceMode === "push-to-talk" ? handleStopRecording : undefined}
                    onTouchStart={voiceMode === "push-to-talk" ? handleStartRecording : undefined}
                    onTouchEnd={voiceMode === "push-to-talk" ? handleStopRecording : undefined}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: isRecording
                        ? [
                            "0 0 0 0 rgba(239, 68, 68, 0.4)",
                            "0 0 0 25px rgba(239, 68, 68, 0)",
                            "0 0 0 0 rgba(239, 68, 68, 0.4)",
                          ]
                        : [
                            "0 0 0 0 rgba(147, 51, 234, 0.4)",
                            "0 0 0 20px rgba(147, 51, 234, 0)",
                            "0 0 0 0 rgba(147, 51, 234, 0.4)",
                          ],
                    }}
                    transition={{
                      boxShadow: {
                        duration: 2.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeOut",
                      },
                    }}
                  >
                    {isRecording ? (
                      voiceMode === "continuous" ? (
                        <Square className="w-8 h-8 text-white mb-1" />
                      ) : (
                        <Mic className="w-8 h-8 text-white mb-1" />
                      )
                    ) : (
                      <Mic className="w-8 h-8 text-white mb-1" />
                    )}
                  </motion.button>
                </div>

                {/* Recording Duration */}
                {isRecording && (
                  <motion.div
                    className="mt-4 px-3 py-1 bg-red-500/20 rounded-full border border-red-300/30"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <p className="text-sm font-medium text-red-700">{formatDuration(recordingDuration)}</p>
                  </motion.div>
                )}

                {/* Button Label */}
                <motion.p
                  className="mt-6 text-sm font-medium text-gray-600 text-center max-w-xs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  {isRecording
                    ? voiceMode === "voice-activation"
                      ? "Listening... (stops automatically)"
                      : voiceMode === "push-to-talk"
                        ? "Recording... (release to send)"
                        : "Recording... (tap to stop)"
                    : getVoiceModeDescription()}
                </motion.p>

                {/* Enhanced Voice Waveform Visualization */}
                {isRecording && ( // Only render when isRecording is true
                  <motion.div
                    className="mt-8 flex space-x-1 h-10 items-end" // Added h-10 and items-end
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {[...Array(7)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full"
                        animate={{
                          height: [8, 32, 8],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.2 + i * 0.2, // Increased duration
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.15, // Adjusted delay
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              /* Enhanced Text Input */
              <div className="space-y-4">
                <form onSubmit={handleTextSubmit} className="flex gap-3">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your message to Sera..."
                    className="flex-1 bg-white/40 backdrop-blur-sm border-white/40 rounded-3xl px-6 py-4 text-gray-800 placeholder-gray-500 focus:bg-white/50 focus:border-white/60 transition-all duration-300 text-lg font-sans" // Added font-sans here
                  />
                  <Button
                    type="submit"
                    disabled={!textInput.trim()}
                    className="bg-gradient-to-br from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-3xl px-8 py-4 shadow-lg disabled:opacity-50 transition-all duration-300"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
                <p className="text-center text-sm font-medium text-gray-600">Share your thoughts with Sera</p>
              </div>
            )}
          </motion.div>

          {/* Quick Mood Tools */}
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button
              onClick={startBreathingExercise}
              variant="ghost"
              className="bg-white/30 hover:bg-white/40 text-gray-700 rounded-full px-6 py-2 text-sm font-medium backdrop-blur-sm border border-white/30"
            >
              Breathing Exercise
            </Button>
            <Button
              onClick={handleGroundingTechnique} // Added onClick handler
              variant="ghost"
              className="bg-white/30 hover:bg-white/40 text-gray-700 rounded-full px-6 py-2 text-sm font-medium backdrop-blur-sm border border-white/30"
            >
              Grounding Technique
            </Button>
          </motion.div>

          {/* Daily Goals */}
          <motion.div
            className="w-full max-w-md mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Your Daily Goals
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="form-checkbox text-purple-600 rounded" />
                  <span>Complete 1 guided meditation</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="form-checkbox text-purple-600 rounded" />
                  <span>Journal for 5 minutes</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="form-checkbox text-purple-600 rounded" />
                  <span>Connect with Sera for 10 minutes</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Right Panel - Live Conversation Insights (Hidden on Mobile) */}
        <motion.div
          className="hidden lg:flex flex-1 flex-col px-8 py-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="space-y-6">
            {/* Conversation Overview */}
            <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Conversation Insights
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {conversationInsights.averageMood.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Current Mood</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{conversationInsights.totalMessages}</div>
                  <div className="text-sm text-gray-600">Messages</div>
                </div>
              </div>
            </Card>

            {/* Current Mood State */}
            <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <MoodIcon mood={conversationInsights.dominantMood} />
                Current Emotional State
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/20 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <MoodIcon mood={conversationInsights.dominantMood} size="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-800 capitalize">
                      {conversationInsights.dominantMood}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Dominant</div>
                </div>

                {/* Mood Distribution */}
                <div className="space-y-2">
                  {Object.entries(conversationInsights.moodDistribution).map(([mood, count]) => (
                    <div key={mood} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MoodIcon mood={mood} size="w-3 h-3" />
                        <span className="text-xs text-gray-700 capitalize">{mood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(
                                10,
                                (count /
                                  Math.max(
                                    1,
                                    Object.values(conversationInsights.moodDistribution).reduce((a, b) => a + b, 0),
                                  )) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Session Information */}
            <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> {/* Changed icon here */}
                Session Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Duration</span>
                  <span className="text-sm font-medium text-gray-800">
                    {conversationInsights.conversationLength} min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Messages exchanged</span>
                  <span className="text-sm font-medium text-gray-800">{conversationInsights.totalMessages}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Session type</span>
                  <span className="text-sm font-medium text-gray-800">Waitlist Demo</span>
                </div>
              </div>
            </Card>

            {/* Wellness Suggestions */}
            <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Suggested Actions
              </h3>
              <div className="space-y-3">
                {conversationInsights.dominantMood === "anxious" && (
                  <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-200/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Wind className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-800">Breathing Exercise</span>
                    </div>
                    <p className="text-xs text-blue-700">Try a calming breathing session</p>
                  </div>
                )}

                {conversationInsights.dominantMood === "sad" && (
                  <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-200/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Cloud className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-800">Gentle Support</span>
                    </div>
                    <p className="text-xs text-purple-700">Continue sharing your feelings</p>
                  </div>
                )}

                {conversationInsights.dominantMood === "hopeful" && (
                  <div className="p-3 bg-yellow-50/50 rounded-2xl border border-yellow-200/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-800">Positive Momentum</span>
                    </div>
                    <p className="text-xs text-yellow-700">Keep building on this energy</p>
                  </div>
                )}

                {conversationInsights.dominantMood === "calm" && (
                  <div className="p-3 bg-green-50/50 rounded-2xl border border-green-200/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Leaf className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-800">Maintain Balance</span>
                    </div>
                    <p className="text-xs text-green-700">You're in a good space</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
      <LumeOSFooter />
      <WaitlistDialog isOpen={showWaitlistDialog} onClose={handleCloseWaitlist} /> {/* Render the dialog */}
      {/* Breathing Exercise Overlay */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4">
              <motion.div
                className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center"
                animate={{
                  scale: breathingPhase === "inhale" ? 1.2 : breathingPhase === "hold" ? 1.2 : 0.8,
                }}
                transition={{
                  duration: breathingPhase === "inhale" ? 4 : breathingPhase === "hold" ? 3 : 8,
                  ease: "easeInOut",
                }}
              >
                <VoiceOrb size="w-12 h-12" animate={true} /> {/* Changed icon to VoiceOrb */}
              </motion.div>

              <motion.p
                className="text-lg font-medium text-gray-800 mb-2"
                key={breathingPhase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {breathingPhase === "inhale" ? "Breathe In" : breathingPhase === "hold" ? "Hold" : "Breathe Out"}
              </motion.p>

              <p className="text-sm text-gray-600 mb-6">Follow the gentle rhythm</p>

              <Button
                onClick={() => setShowBreathing(false)}
                variant="ghost"
                className="bg-white/50 hover:bg-white/70 text-gray-700 rounded-full px-6"
              >
                Close
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Grounding Technique Overlay */}
      <AnimatePresence>
        {showGrounding && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={groundingStep} // Key for animating content changes
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {groundingStepsContent[groundingStep].icon && (
                    <motion.div
                      className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${groundingStepsContent[
                        groundingStep
                      ].color.replace("text-", "bg-")}/20`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      {groundingStepsContent[groundingStep].icon}
                    </motion.div>
                  )}

                  <h3 className={`text-xl font-semibold ${groundingStepsContent[groundingStep].color} mb-4`}>
                    {" "}
                    {/* Changed text size to text-xl */}
                    {groundingStepsContent[groundingStep].title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">{groundingStepsContent[groundingStep].description}</p>
                </motion.div>
              </AnimatePresence>

              <Button
                onClick={handleNextGroundingStep}
                variant="ghost"
                className="bg-white/50 hover:bg-white/70 text-gray-700 rounded-full px-6"
              >
                {groundingStepsContent[groundingStep].buttonText}
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Subtle Status Indicator */}
      <motion.div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
          <p className="text-xs text-gray-600 flex items-center">
            <div className={`w-2 h-2 ${isRecording ? "bg-green-400" : isPlayingIntroduction ? "bg-blue-400" : "bg-red-400"} rounded-full mr-2 animate-pulse`} />
            Sera is {isRecording ? "listening" : isPlayingIntroduction ? "speaking" : "idle"} •{" "}
            {responseMode === "voice" ? "Voice responses" : "Text responses"}
          </p>
        </div>
      </motion.div>
      {/* Voice/Text Selector Popup - First Time Experience */}
      <AnimatePresence>
        {showVoiceSelector && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                  <VoiceOrb size="w-8 h-8" animate={true} />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to LumeOS</h3>
                <p className="text-gray-600 mb-8">How would you like to communicate with Sera?</p>

                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      setInputMode("voice")
                      setResponseMode("voice") // Enable voice responses when voice communication is selected
                      handleVoiceSelectorClose()
                    }}
                    className="w-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl py-4 shadow-lg transition-all duration-300"
                  >
                    <Mic className="w-5 h-5 mr-3" />
                    Voice Communication
                  </Button>

                  <Button
                    onClick={() => {
                      setInputMode("text")
                      handleVoiceSelectorClose()
                    }}
                    variant="outline"
                    className="w-full bg-white/50 hover:bg-white/70 text-gray-700 rounded-2xl py-4 border-white/60 shadow-md transition-all duration-300"
                  >
                    <Type className="w-5 h-5 mr-3" />
                    Text Communication
                  </Button>
                </div>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <MoodSelectorPopup
        isOpen={showMoodSelector}
        onClose={() => setShowMoodSelector(false)}
        onMoodSelect={handleMoodSelect}
      />
    </div>
  )
}
