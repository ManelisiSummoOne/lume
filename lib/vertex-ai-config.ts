export interface VertexAIModel {
  id: string
  name: string
  description: string
  useCases: string[]
  triggerKeywords: string[]
  emotionalStates: string[]
  complexity: 'simple' | 'medium' | 'complex'
}

// Configure your deployed Vertex AI model
// Replace with your actual model ID and customize the description
export const VERTEX_AI_MODELS: VertexAIModel[] = [
  {
    id: process.env.SERA_MODEL_ID || 'your-deployed-model-id',
    name: process.env.SERA_MODEL_NAME || 'Sera AI',
    description: 'Your deployed model for Sera conversations and mental health support',
    useCases: ['conversation', 'emotional_support', 'mental_health', 'therapy', 'guidance'],
    triggerKeywords: [], // Not needed for single model
    emotionalStates: ['all'], // Handles all emotional states
    complexity: 'medium' // Can handle all complexity levels
  }
]

export interface UserInputAnalysis {
  text: string
  mood?: string
  intensity?: number
  emotionalState?: string
  urgency: 'low' | 'medium' | 'high'
  complexity: 'simple' | 'medium' | 'complex'
  keywords: string[]
}

export class ModelSelector {
  static analyzeUserInput(input: string, mood?: { mood: string; intensity: number }): UserInputAnalysis {
    const lowercaseInput = input.toLowerCase()
    const words = lowercaseInput.split(/\s+/)
    
    // Detect urgency keywords
    const urgencyKeywords = {
      high: ['crisis', 'emergency', 'suicidal', 'panic', 'help me', 'can\'t cope', 'breakdown'],
      medium: ['anxiety', 'depression', 'stressed', 'overwhelmed', 'worried', 'scared'],
      low: ['feeling', 'mood', 'today', 'hello', 'hi', 'how are you']
    }

    // Detect complexity indicators
    const complexityKeywords = {
      complex: ['trauma', 'ptsd', 'crisis', 'emergency', 'severe', 'chronic', 'ongoing'],
      medium: ['therapy', 'counseling', 'coping', 'strategies', 'advice', 'guidance'],
      simple: ['feeling', 'mood', 'today', 'quick', 'hello', 'hi']
    }

    let urgency: 'low' | 'medium' | 'high' = 'low'
    let complexity: 'simple' | 'medium' | 'complex' = 'simple'
    const detectedKeywords: string[] = []

    // Check for urgency
    for (const [level, keywords] of Object.entries(urgencyKeywords)) {
      for (const keyword of keywords) {
        if (lowercaseInput.includes(keyword)) {
          urgency = level as 'low' | 'medium' | 'high'
          detectedKeywords.push(keyword)
        }
      }
    }

    // Check for complexity
    for (const [level, keywords] of Object.entries(complexityKeywords)) {
      for (const keyword of keywords) {
        if (lowercaseInput.includes(keyword)) {
          complexity = level as 'simple' | 'medium' | 'complex'
          detectedKeywords.push(keyword)
        }
      }
    }

    // Consider mood intensity if provided
    if (mood && mood.intensity >= 8) {
      urgency = urgency === 'low' ? 'medium' : 'high'
    }
    if (mood && mood.intensity >= 9) {
      complexity = complexity === 'simple' ? 'medium' : 'complex'
    }

    // Detect emotional state from mood
    let emotionalState = mood?.mood || 'neutral'
    if (lowercaseInput.includes('panic') || lowercaseInput.includes('crisis')) {
      emotionalState = 'crisis'
    }

    return {
      text: input,
      mood: mood?.mood,
      intensity: mood?.intensity,
      emotionalState,
      urgency,
      complexity,
      keywords: detectedKeywords
    }
  }

  static selectModel(analysis: UserInputAnalysis): VertexAIModel {
    // With only one model, always return the first (and only) model
    return VERTEX_AI_MODELS[0]
  }

  static getModelSystemPrompt(model: VertexAIModel, analysis: UserInputAnalysis): string {
    const basePrompt = `You are Sera, a compassionate AI mental health companion integrated into LumeOS. You provide empathetic, supportive responses while being mindful of your limitations as an AI.`

    // Single model prompt - adapt based on user input analysis
    let prompt = `${basePrompt} Provide thoughtful, empathetic responses tailored to the user's emotional state and needs. You can offer emotional support, coping strategies, mindfulness techniques, and practical guidance. Always prioritize user safety and well-being.`

    // Add context based on analysis
    if (analysis.mood) {
      prompt += ` The user's current mood is "${analysis.mood}" with intensity ${analysis.intensity}/10.`
    }

    if (analysis.urgency === 'high') {
      prompt += ` This appears to be an urgent situation requiring extra care and possible crisis support.`
    }

    if (analysis.keywords.length > 0) {
      prompt += ` Key concerns detected: ${analysis.keywords.join(', ')}.`
    }

    prompt += ` Always prioritize user safety and well-being. If you detect signs of immediate danger, encourage seeking professional help or emergency services.`

    return prompt
  }
}