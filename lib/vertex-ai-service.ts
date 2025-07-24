import { VertexAI, GenerativeModel } from '@google-cloud/vertexai'
import { VertexAIModel, UserInputAnalysis, ModelSelector, VERTEX_AI_MODELS } from './vertex-ai-config'

export interface VertexAIConfig {
  projectId: string
  location: string
  credentials?: any
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export class VertexAIService {
  private vertexAI: VertexAI
  private models: Map<string, GenerativeModel> = new Map()

  constructor(config: VertexAIConfig) {
    this.vertexAI = new VertexAI({
      project: config.projectId,
      location: config.location,
      googleAuthOptions: config.credentials ? { 
        credentials: config.credentials 
      } : undefined
    })

    // Initialize the three models
    this.initializeModels()
  }

  private initializeModels() {
    // Get your deployed model IDs from configuration
    const modelIds = VERTEX_AI_MODELS.map(model => model.id)
    
    modelIds.forEach(modelId => {
              try {
          const model = this.vertexAI.getGenerativeModel({
            model: modelId,
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
            },
            // Note: Some custom models may not support all safety settings
            // Remove or adjust these if your model doesn't support them
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
            ],
          })
          this.models.set(modelId, model)
          console.log(`Successfully initialized model: ${modelId}`)
        } catch (error) {
          console.error(`Failed to initialize model ${modelId}:`, error)
          // For custom models, try without safety settings if initialization fails
          try {
            const model = this.vertexAI.getGenerativeModel({
              model: modelId,
              generationConfig: {
                maxOutputTokens: 8192,
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
              },
            })
            this.models.set(modelId, model)
            console.log(`Successfully initialized model ${modelId} (without safety settings)`)
          } catch (fallbackError) {
            console.error(`Failed to initialize model ${modelId} even without safety settings:`, fallbackError)
          }
        }
    })
  }

  async generateResponse(
    userInput: string,
    chatHistory: ChatMessage[],
    userMood?: { mood: string; intensity: number }
  ): Promise<AsyncIterable<string>> {
    // Analyze user input to determine which model to use
    const analysis = ModelSelector.analyzeUserInput(userInput, userMood)
    const selectedModel = ModelSelector.selectModel(analysis)
    const systemPrompt = ModelSelector.getModelSystemPrompt(selectedModel, analysis)

    console.log(`Selected model: ${selectedModel.name} (${selectedModel.id})`)
    console.log(`Analysis:`, analysis)

    const model = this.models.get(selectedModel.id)
    if (!model) {
      throw new Error(`Model ${selectedModel.id} not available`)
    }

    // Prepare conversation history
    const conversation = this.formatConversationHistory(chatHistory, systemPrompt)
    
    try {
      const streamingResult = await model.generateContentStream({
        contents: conversation,
      })

      // Return an async generator that yields chunks
      return this.createStreamGenerator(streamingResult, selectedModel)
    } catch (error) {
      console.error(`Error generating response with ${selectedModel.id}:`, error)
      throw new Error(`Failed to generate response: ${error}`)
    }
  }

  private formatConversationHistory(chatHistory: ChatMessage[], systemPrompt: string) {
    const contents = []

    // Add system prompt as the first user message
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt }]
    })

    // Add a brief system acknowledgment
    contents.push({
      role: 'model',
      parts: [{ text: 'I understand. I\'m Sera, and I\'m here to support you.' }]
    })

    // Add conversation history
    chatHistory.forEach((message) => {
      contents.push({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }]
      })
    })

    return contents
  }

  private async* createStreamGenerator(
    streamingResult: any,
    selectedModel: VertexAIModel
  ): AsyncIterable<string> {
    try {
      for await (const chunk of streamingResult.stream) {
        const chunkText = chunk.candidates?.[0]?.content?.parts?.[0]?.text
        if (chunkText) {
          yield chunkText
        }
      }
    } catch (error) {
      console.error(`Streaming error with ${selectedModel.id}:`, error)
      yield `I apologize, but I encountered an error while processing your message. Please try again.`
    }
  }

  // Get model information for debugging/monitoring
  getModelInfo(modelId: string): VertexAIModel | undefined {
    const vertexModels = [
      { id: 'gemini-1.5-flash', name: 'Gemini Flash', description: 'Fast responses', useCases: [], triggerKeywords: [], emotionalStates: [], complexity: 'simple' as const },
      { id: 'gemini-1.5-pro', name: 'Gemini Pro', description: 'Balanced responses', useCases: [], triggerKeywords: [], emotionalStates: [], complexity: 'medium' as const },
      { id: 'gemini-1.0-ultra', name: 'Gemini Ultra', description: 'Advanced responses', useCases: [], triggerKeywords: [], emotionalStates: [], complexity: 'complex' as const }
    ]
    return vertexModels.find(model => model.id === modelId)
  }

  // Health check for models with detailed error reporting
  async checkModelAvailability(): Promise<{ [key: string]: { available: boolean, error?: string } }> {
    const availability: { [key: string]: { available: boolean, error?: string } } = {}
    
    for (const [modelId, model] of this.models.entries()) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: 'test' }] }]
        })
        availability[modelId] = { available: true }
        console.log(`✅ Model ${modelId} health check passed`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Model ${modelId} health check failed:`, errorMessage)
        availability[modelId] = { available: false, error: errorMessage }
      }
    }
    
    return availability
  }
}

// Singleton instance factory
let vertexAIServiceInstance: VertexAIService | null = null

export function getVertexAIService(config?: VertexAIConfig): VertexAIService {
  if (!vertexAIServiceInstance) {
    if (!config) {
      throw new Error('VertexAI service not initialized. Please provide configuration.')
    }
    vertexAIServiceInstance = new VertexAIService(config)
  }
  return vertexAIServiceInstance
}