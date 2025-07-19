"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Leaf, Wind, Cloud, Sun, Smile, Heart, Zap, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface MoodSelectorPopupProps {
  isOpen: boolean
  onClose: () => void
  onMoodSelect: (mood: string, intensity: number) => void
}

const moodOptions = [
  { id: "calm", label: "Calm", icon: <Leaf className="w-8 h-8" />, color: "from-green-400 to-green-600" },
  { id: "anxious", label: "Anxious", icon: <Wind className="w-8 h-8" />, color: "from-gray-400 to-gray-600" },
  { id: "sad", label: "Sad", icon: <Cloud className="w-8 h-8" />, color: "from-blue-400 to-blue-600" },
  { id: "hopeful", label: "Hopeful", icon: <Sun className="w-8 h-8" />, color: "from-yellow-400 to-yellow-600" },
  { id: "excited", label: "Excited", icon: <Zap className="w-8 h-8" />, color: "from-orange-400 to-orange-600" },
  { id: "content", label: "Content", icon: <Heart className="w-8 h-8" />, color: "from-pink-400 to-pink-600" },
  { id: "energetic", label: "Energetic", icon: <Coffee className="w-8 h-8" />, color: "from-red-400 to-red-600" },
  { id: "neutral", label: "Neutral", icon: <Smile className="w-8 h-8" />, color: "from-purple-400 to-purple-600" },
]

export function MoodSelectorPopup({ isOpen, onClose, onMoodSelect }: MoodSelectorPopupProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(5)

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId)
  }

  const handleSubmit = () => {
    if (selectedMood) {
      onMoodSelect(selectedMood, intensity)
      onClose()
      setSelectedMood(null)
      setIntensity(5)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[500px] p-6 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-2xl font-light text-gray-800 mb-2">
                  How are you feeling right now?
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Help Sera understand your current emotional state
                </DialogDescription>
              </DialogHeader>

              {/* Mood Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {moodOptions.map((mood) => (
                  <motion.button
                    key={mood.id}
                    onClick={() => handleMoodSelect(mood.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      selectedMood === mood.id
                        ? "border-purple-400 bg-purple-50/50 scale-105"
                        : "border-white/40 bg-white/30 hover:bg-white/50"
                    }`}
                    whileHover={{ scale: selectedMood === mood.id ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${mood.color} flex items-center justify-center text-white`}
                    >
                      {mood.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-700">{mood.label}</p>
                  </motion.button>
                ))}
              </div>

              {/* Intensity Slider */}
              {selectedMood && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How intense is this feeling? ({intensity}/10)
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${intensity * 10}%, #e5e7eb ${intensity * 10}%, #e5e7eb 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Mild</span>
                      <span>Intense</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 bg-white/50 hover:bg-white/70 text-gray-700 rounded-2xl py-3 border-white/60"
                >
                  Skip for now
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedMood}
                  className="flex-1 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl py-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
