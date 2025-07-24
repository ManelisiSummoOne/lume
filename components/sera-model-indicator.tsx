"use client"

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Zap, 
  Heart, 
  Shield, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Activity 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModelInfo {
  id: string
  name: string
  description: string
  complexity: 'simple' | 'medium' | 'complex'
  isActive?: boolean
}

interface SeraModelIndicatorProps {
  className?: string
}

const MODEL_ICONS = {
  'default': Brain, // Default icon for any model
}

const COMPLEXITY_COLORS = {
  simple: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200', 
  complex: 'bg-purple-100 text-purple-800 border-purple-200',
}

export function SeraModelIndicator({ className = '' }: SeraModelIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [modelStatus, setModelStatus] = useState<{
    status: string
    models: { [key: string]: boolean }
    config?: any
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const models: ModelInfo[] = [
    {
      id: process.env.NEXT_PUBLIC_SERA_MODEL_ID || 'your-deployed-model',
      name: process.env.NEXT_PUBLIC_SERA_MODEL_NAME || 'Sera AI',
      description: 'Your deployed model for mental health conversations and support',
      complexity: 'medium'
    }
  ]

  useEffect(() => {
    checkModelStatus()
  }, [])

  const checkModelStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/sera-chat', {
        method: 'GET'
      })
      const data = await response.json()
      setModelStatus(data)
    } catch (error) {
      console.error('Failed to check model status:', error)
      setModelStatus({
        status: 'error',
        models: {}
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getModelStatus = (modelId: string) => {
    if (!modelStatus?.models) return 'unknown'
    return modelStatus.models[modelId] ? 'available' : 'unavailable'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600'
      case 'unavailable': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900">Sera AI Models</span>
          </div>
          {isLoading ? (
            <Badge variant="outline" className="animate-pulse">
              Checking...
            </Badge>
          ) : (
            <Badge 
              variant={modelStatus?.status === 'ok' ? 'default' : 'destructive'}
              className={modelStatus?.status === 'ok' ? 'bg-green-100 text-green-800 border-green-200' : ''}
            >
              {modelStatus?.status === 'ok' ? 'Online' : 'Issues'}
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 px-2"
        >
          <Info className="w-4 h-4 mr-1" />
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
                             <div className="text-sm text-gray-600 mb-3">
                 Your deployed Sera model status:
               </div>
              
                             {models.map((model) => {
                 const IconComponent = MODEL_ICONS['default']
                 const status = getModelStatus(model.id)
                
                return (
                  <div 
                    key={model.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-gray-700" />
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {model.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {model.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={COMPLEXITY_COLORS[model.complexity]}
                      >
                        {model.complexity}
                      </Badge>
                      <div className={`text-xs font-medium ${getStatusColor(status)}`}>
                        {status === 'available' ? '●' : status === 'unavailable' ? '●' : '○'}
                      </div>
                    </div>
                  </div>
                )
              })}

                             <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                 <div className="text-sm text-blue-800">
                   <Heart className="w-4 h-4 inline mr-1" />
                   <strong>How it works:</strong> Your deployed Vertex AI model provides personalized mental health support and therapeutic conversations.
                 </div>
               </div>

              {modelStatus?.config && (
                <div className="mt-2 text-xs text-gray-500">
                  Project: {modelStatus.config.projectId} • Region: {modelStatus.config.location}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}