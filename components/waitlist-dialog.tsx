"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useActionState } from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { joinWaitlistAction } from "@/actions/waitlist"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface WaitlistDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function WaitlistDialog({ isOpen, onClose }: WaitlistDialogProps) {
  const [state, formAction, isPending] = useActionState(joinWaitlistAction, null)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (state?.success) {
      setEmail("") // Clear email on successful submission
      // Optionally close the dialog after a short delay
      setTimeout(onClose, 2000)
    }
  }, [state, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px] p-6 bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-3xl font-light text-gray-800 mb-2">Join the Waitlist</DialogTitle>
                <DialogDescription className="text-gray-600 text-base">
                  Be among the first to experience LumeOS.
                </DialogDescription>
              </DialogHeader>

              <form action={formAction} className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/60 border-white/50 rounded-xl px-5 py-3 text-gray-800 placeholder-gray-500 focus:bg-white/80 focus:border-purple-300 transition-all duration-200"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-3 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Submitting..." : "Join Waitlist"}
                </Button>
              </form>

              {state && (
                <motion.div
                  className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${
                    state.success ? "bg-green-50/70 text-green-800" : "bg-red-50/70 text-red-800"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {state.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <p className="text-sm">{state.message}</p>
                </motion.div>
              )}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
