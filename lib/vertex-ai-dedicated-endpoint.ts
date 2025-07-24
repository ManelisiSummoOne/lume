import { GoogleAuth } from 'google-auth-library'
import { VertexAIModel, UserInputAnalysis, ModelSelector, VERTEX_AI_MODELS } from './vertex-ai-config'

export interface DedicatedEndpointConfig {
  projectId: string
  location: string
  endpointId: string
  endpointUrl: string
  credentials?: any
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export class DedicatedVertexAIService {
  private auth: GoogleAuth
  private config: DedicatedEndpointConfig

  constructor(config: DedicatedEndpointConfig) {
    this.config = config
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      credentials: config.credentials,
      projectId: config.projectId,
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

    console.log(`Using dedicated endpoint: ${this.config.endpointUrl}`)

    // For dedicated endpoints, we need to make direct HTTP requests
    const conversation = this.formatConversationForDedicatedEndpoint(chatHistory, systemPrompt, userInput)
    
    try {
      return this.makePredictionRequest(conversation, selectedModel)
    } catch (error) {
      console.error(`Error with dedicated endpoint:`, error)
      throw new Error(`Failed to generate response: ${error}`)
    }
  }

  private formatConversationForDedicatedEndpoint(
    chatHistory: ChatMessage[], 
    systemPrompt: string, 
    currentInput: string
  ) {
    // Format for your specific model - this may need adjustment based on your model's expected format
    const conversation = []
    
    // Add system prompt
    conversation.push({
      role: 'system',
      content: systemPrompt
    })

    // Add conversation history
    chatHistory.forEach((message) => {
      conversation.push({
        role: message.role,
        content: message.content
      })
    })

    // Add current input
    conversation.push({
      role: 'user',
      content: currentInput
    })

    // Return in the format expected by your dedicated endpoint
    return {
      instances: [
        {
          messages: conversation
        }
      ],
      parameters: {
        max_output_tokens: 2048,
        temperature: 0.7,
        top_p: 0.8,
        top_k: 40
      }
    }
  }

  private async* makePredictionRequest(
    payload: any,
    selectedModel: VertexAIModel
  ): AsyncIterable<string> {
    try {
      // Get access token
      const accessToken = await this.auth.getAccessToken()
      
      // Construct the prediction URL
      const predictionUrl = `${this.config.endpointUrl}/v1/projects/${this.config.projectId}/locations/${this.config.location}/endpoints/${this.config.endpointId}:predict`
      
      console.log(`Making request to: ${predictionUrl}`)

      const response = await fetch(predictionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Prediction request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Prediction response:', result)

      // Extract the response text - this format may need adjustment based on your model's response format
      if (result.predictions && result.predictions.length > 0) {
        const prediction = result.predictions[0]
        
        // Handle different possible response formats
        let responseText = ''
        if (typeof prediction === 'string') {
          responseText = prediction
        } else if (prediction.content) {
          responseText = prediction.content
        } else if (prediction.generated_text) {
          responseText = prediction.generated_text
        } else if (prediction.response) {
          responseText = prediction.response
        } else {
          responseText = JSON.stringify(prediction)
        }

        // Simulate streaming by yielding the full response
        // For true streaming, you'd need to check if your endpoint supports streaming
        yield responseText
      } else {
        yield "I apologize, but I didn't receive a proper response. Please try again."
      }

    } catch (error) {
      console.error(`Error making prediction request:`, error)
      yield `I apologize, but I encountered an error while processing your message: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  async checkModelAvailability(): Promise<{ [key: string]: { available: boolean, error?: string } }> {
    const availability: { [key: string]: { available: boolean, error?: string } } = {}
    
    try {
      // Test with a simple request
      const testPayload = {
        instances: [
          {
            messages: [
              { role: 'user', content: 'Hello, please respond with just "Hi" to test the connection.' }
            ]
          }
        ],
        parameters: {
          max_output_tokens: 10,
          temperature: 0.1
        }
      }

      const accessToken = await this.auth.getAccessToken()
      const predictionUrl = `${this.config.endpointUrl}/v1/projects/${this.config.projectId}/locations/${this.config.location}/endpoints/${this.config.endpointId}:predict`
      
      const response = await fetch(predictionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      })

      if (response.ok) {
        const result = await response.json()
        availability[this.config.endpointId] = { available: true }
        console.log(`✅ Dedicated endpoint ${this.config.endpointId} health check passed`)
      } else {
        const errorText = await response.text()
        availability[this.config.endpointId] = { 
          available: false, 
          error: `HTTP ${response.status}: ${errorText}` 
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      availability[this.config.endpointId] = { available: false, error: errorMessage }
      console.error(`❌ Dedicated endpoint ${this.config.endpointId} health check failed:`, errorMessage)
    }
    
    return availability
  }
}

// Singleton instance factory for dedicated endpoints
let dedicatedVertexAIServiceInstance: DedicatedVertexAIService | null = null

export function getDedicatedVertexAIService(config?: DedicatedEndpointConfig): DedicatedVertexAIService {
  if (!dedicatedVertexAIServiceInstance) {
    if (!config) {
      throw new Error('Dedicated VertexAI service not initialized. Please provide configuration.')
    }
    dedicatedVertexAIServiceInstance = new DedicatedVertexAIService(config)
  }
  return dedicatedVertexAIServiceInstance
}