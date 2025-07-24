export interface VertexAIModel {
  id: string
  name: string
  description: string
  useCases: string[]
  triggerKeywords: string[]
  emotionalStates: string[]
  complexity: 'simple' | 'medium' | 'complex'
}

export const VERTEX_AI_MODELS: VertexAIModel[] = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini Flash',
    description: 'Fast, lightweight model for quick emotional check-ins and basic support',
    useCases: ['quick_checkin', 'mood_tracking', 'simple_questions', 'greetings'],
    triggerKeywords: ['hi', 'hello', 'how are you', 'quick', 'feeling', 'mood', 'today'],
    emotionalStates: ['neutral', 'calm', 'curious'],
    complexity: 'simple'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini Pro',
    description: 'Balanced model for deeper conversations and therapeutic guidance',
    useCases: ['therapy', 'coping_strategies', 'emotional_support', 'mindfulness'],
    triggerKeywords: ['therapy', 'help', 'anxiety', 'depression', 'stressed', 'coping', 'advice', 'guidance', 'mindfulness', 'meditation'],
    emotionalStates: ['anxious', 'sad', 'stressed', 'overwhelmed', 'hopeful'],
    complexity: 'medium'
  },
  {
    id: 'gemini-1.0-ultra',
    name: 'Gemini Ultra',
    description: 'Advanced model for complex emotional situations and crisis support',
    useCases: ['crisis_support', 'complex_trauma', 'detailed_analysis', 'personalized_plans'],
    triggerKeywords: ['crisis', 'emergency', 'suicidal', 'panic', 'trauma', 'ptsd', 'severe', 'breakdown', 'can\'t cope'],
    emotionalStates: ['severe_anxiety', 'panic', 'despair', 'crisis', 'trauma'],
    complexity: 'complex'
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
    // Crisis situations always get Ultra model
    if (analysis.urgency === 'high' || analysis.complexity === 'complex') {
      return VERTEX_AI_MODELS[2] // Gemini Ultra
    }

    // Medium complexity/urgency gets Pro model
    if (analysis.urgency === 'medium' || analysis.complexity === 'medium') {
      return VERTEX_AI_MODELS[1] // Gemini Pro
    }

    // Check for specific keywords that indicate need for specialized models
    const inputLower = analysis.text.toLowerCase()
    
    // Pro model keywords
    const proKeywords = VERTEX_AI_MODELS[1].triggerKeywords
    if (proKeywords.some(keyword => inputLower.includes(keyword))) {
      return VERTEX_AI_MODELS[1] // Gemini Pro
    }

    // Ultra model keywords
    const ultraKeywords = VERTEX_AI_MODELS[2].triggerKeywords
    if (ultraKeywords.some(keyword => inputLower.includes(keyword))) {
      return VERTEX_AI_MODELS[2] // Gemini Ultra
    }

    // Default to Flash for simple interactions
    return VERTEX_AI_MODELS[0] // Gemini Flash
  }

  static getModelSystemPrompt(model: VertexAIModel, analysis: UserInputAnalysis): string {
    const basePrompt = `You are Sera, a compassionate AI mental health companion integrated into LumeOS. You provide empathetic, supportive responses while being mindful of your limitations as an AI.`

    const modelSpecificPrompts = {
      'gemini-1.5-flash': `${basePrompt} Keep responses concise and encouraging. Focus on immediate emotional support and simple coping strategies. This is a quick check-in conversation.`,
      
      'gemini-1.5-pro': `${basePrompt} Provide thoughtful, therapeutic responses. You can suggest coping strategies, mindfulness techniques, and deeper emotional exploration. Balance empathy with practical guidance.`,
      
      'gemini-1.0-ultra': `${basePrompt} This may be a crisis or complex emotional situation. Provide comprehensive support while being extra cautious about safety. Consider suggesting professional help if appropriate. Be thorough but gentle.`
    }

    let prompt = modelSpecificPrompts[model.id] || modelSpecificPrompts['gemini-1.5-flash']

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