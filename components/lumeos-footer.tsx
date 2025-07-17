"use client"

import { motion } from "framer-motion"
import { ShieldAlert, Globe } from "lucide-react"
import { Card } from "@/components/ui/card"

export function LumeOSFooter() {
  return (
    <motion.footer
      className="w-full mt-16 py-12 px-4 lg:px-8 bg-gradient-to-t from-white/20 to-transparent backdrop-blur-sm rounded-t-3xl border-t border-white/30 shadow-inner"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 1 }}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Medical Disclaimer */}
        <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-6 rounded-2xl shadow-lg">
          <div className="flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold text-purple-800">
                  LumeOS and Sera are not substitutes for professional mental health care.
                </span>{" "}
                This platform does not provide medical advice, diagnosis, or treatment. If you are in crisis or need
                immediate support, please seek help from a licensed professional or contact emergency services.
              </p>
            </div>
          </div>
        </Card>

        {/* Global Support Hotlines */}
        <Card className="bg-white/30 backdrop-blur-sm border-white/30 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-pink-600" />
            Need urgent support? Talk to someone now:
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex justify-between items-center group">
              <span className="font-medium text-gray-800">South Africa: SADAG</span>
              <a href="tel:0800567567" className="text-purple-600 hover:text-purple-800 transition-colors duration-200">
                0800 567 567
              </a>
            </li>
            <li className="flex justify-between items-center group">
              <span className="font-medium text-gray-800">USA: 988 Suicide & Crisis Lifeline</span>
              <a href="tel:988" className="text-purple-600 hover:text-purple-800 transition-colors duration-200">
                call or text 988
              </a>
            </li>
            <li className="flex justify-between items-center group">
              <span className="font-medium text-gray-800">UK: Samaritans</span>
              <a href="tel:116123" className="text-purple-600 hover:text-purple-800 transition-colors duration-200">
                116 123
              </a>
            </li>
          </ul>
        </Card>

        {/* Optional Soft Message */}
        <motion.p
          className="text-center text-md font-light text-gray-600 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          You are not alone. Help is always near.
        </motion.p>
      </div>
    </motion.footer>
  )
}
