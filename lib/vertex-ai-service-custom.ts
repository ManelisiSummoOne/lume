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

export class CustomVertexAIService {
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

    this.initializeModels()
  }

  private initializeModels() {
    const modelIds = VERTEX_AI_MODELS.map(model => model.id)
    
    modelIds.forEach(modelId => {
      try {
        // For custom models, try minimal configuration first
        const model = this.vertexAI.getGenerativeModel({
          model: modelId,
          // Minimal config for custom models
          generationConfig: {
            maxOutputTokens: 4096,
            temperature: 0.7,
          },
          // Don't set safety settings for custom models initially
        })
        this.models.set(modelId, model)
        console.log(`Successfully initialized custom model: ${modelId}`)
      } catch (error) {
        console.error(`Failed to initialize custom model ${modelId}:`, error)
        
        // Try alternative configuration for custom endpoints
        try {
          const model = this.vertexAI.getGenerativeModel({
            model: modelId,
            // Even more minimal config
            generationConfig: {
              maxOutputTokens: 2048,
              temperature: 0.5,
            },
          })
          this.models.set(modelId, model)
          console.log(`Successfully initialized custom model ${modelId} with minimal config`)
        } catch (fallbackError) {
          console.error(`Failed to initialize custom model ${modelId} with minimal config:`, fallbackError)
        }
      }
    })
  }

  async generateResponse(
    userInput: string,
    chatHistory: ChatMessage[],
    userMood?: { mood: string; intensity: number }
  ): Promise<AsyncIterable<string>> {
    const analysis = ModelSelector.analyzeUserInput(userInput, userMood)
    const selectedModel = ModelSelector.selectModel(analysis)
    const systemPrompt = ModelSelector.getModelSystemPrompt(selectedModel, analysis)

    console.log(`Selected custom model: ${selectedModel.name} (${selectedModel.id})`)

    const model = this.models.get(selectedModel.id)
    if (!model) {
      throw new Error(`Custom model ${selectedModel.id} not available`)
    }

    // For custom models, use simpler conversation format
    const conversation = this.formatConversationForCustomModel(chatHistory, systemPrompt, userInput)
    
    try {
      const streamingResult = await model.generateContentStream({
        contents: conversation,
      })

      return this.createStreamGenerator(streamingResult, selectedModel)
    } catch (error) {
      console.error(`Error generating response with custom model ${selectedModel.id}:`, error)
      throw new Error(`Failed to generate response: ${error}`)
    }
  }

  private formatConversationForCustomModel(chatHistory: ChatMessage[], systemPrompt: string, currentInput: string) {
    // For custom models, try a simpler format
    const contents = []

    // Add system prompt and current input together
    const fullPrompt = `${systemPrompt}\n\nConversation history:\n${
      chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')
    }\n\nUser: ${currentInput}\n\nAssistant:`

    contents.push({
      role: 'user',
      parts: [{ text: fullPrompt }]
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
      console.error(`Streaming error with custom model ${selectedModel.id}:`, error)
      yield `I apologize, but I encountered an error while processing your message. Please try again.`
    }
  }

  async checkModelAvailability(): Promise<{ [key: string]: { available: boolean, error?: string } }> {
    const availability: { [key: string]: { available: boolean, error?: string } } = {}
    
    for (const [modelId, model] of this.models.entries()) {
      try {
        // For custom models, use a very simple test
        const result = await model.generateContent({
          contents: [{ 
            role: 'user', 
            parts: [{ text: 'Hello. Please respond with just "Hi" to confirm you are working.' }] 
          }]
        })
        
        const response = result.response
        if (response) {
          availability[modelId] = { available: true }
          console.log(`✅ Custom model ${modelId} health check passed`)
        } else {
          availability[modelId] = { available: false, error: 'No response received' }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Custom model ${modelId} health check failed:`, errorMessage)
        availability[modelId] = { available: false, error: errorMessage }
      }
    }
    
    return availability
  }
}

// Singleton instance factory for custom models
let customVertexAIServiceInstance: CustomVertexAIService | null = null

export function getCustomVertexAIService(config?: VertexAIConfig): CustomVertexAIService {
  if (!customVertexAIServiceInstance) {
    if (!config) {
      throw new Error('Custom VertexAI service not initialized. Please provide configuration.')
    }
    customVertexAIServiceInstance = new CustomVertexAIService(config)
  }
  return customVertexAIServiceInstance
}