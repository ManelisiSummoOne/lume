import { NextRequest, NextResponse } from 'next/server'
import { getDedicatedVertexAIService } from '../../../lib/vertex-ai-dedicated-endpoint'
import type { ChatMessage } from '../../../lib/vertex-ai-dedicated-endpoint'

// Environment configuration for dedicated Vertex AI endpoint
const DEDICATED_ENDPOINT_CONFIG = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.PROJECT_ID || '',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'europe-west4',
  endpointId: process.env.SERA_MODEL_ID || '2159768491417141248',
  endpointUrl: process.env.SERA_ENDPOINT_URL || 'https://2159768491417141248.europe-west4-1075430485377.prediction.vertexai.goog',
  credentials: process.env.GOOGLE_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    : undefined
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userMood } = await req.json()

    // Validate required environment variables
    if (!DEDICATED_ENDPOINT_CONFIG.projectId) {
      console.error('Missing GOOGLE_CLOUD_PROJECT_ID environment variable')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    if (!DEDICATED_ENDPOINT_CONFIG.endpointUrl) {
      console.error('Missing SERA_ENDPOINT_URL environment variable')
      return NextResponse.json(
        { error: 'Endpoint URL not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Convert messages to the format expected by our service
    const chatHistory: ChatMessage[] = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    // Get the current user input (last message)
    const currentInput = messages[messages.length - 1]?.content || ''

    // Get or initialize the dedicated Vertex AI service
    const vertexService = getDedicatedVertexAIService(DEDICATED_ENDPOINT_CONFIG)

    // Generate response using the dedicated endpoint
    const responseStream = await vertexService.generateResponse(
      currentInput,
      chatHistory,
      userMood
    )

    // Create a ReadableStream to send the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          for await (const chunk of responseStream) {
            // Format the chunk in the same way as the AI SDK
            const formattedChunk = chunk
            controller.enqueue(encoder.encode(formattedChunk))
          }
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(encoder.encode('I apologize, but I encountered an error. Please try again.'))
        } finally {
          controller.close()
        }
      }
    })

    // Return the stream with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error in /api/sera-chat-dedicated:', error)
    
    // Return a user-friendly error message
    const errorMessage = error instanceof Error 
      ? `I'm sorry, I'm having trouble processing your request: ${error.message}`
      : 'I\'m sorry, I encountered an unexpected error. Please try again.'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Health check endpoint for dedicated endpoint
export async function GET(req: NextRequest) {
  try {
    if (!DEDICATED_ENDPOINT_CONFIG.projectId) {
      return NextResponse.json(
        { status: 'error', message: 'Missing configuration' },
        { status: 500 }
      )
    }

    const vertexService = getDedicatedVertexAIService(DEDICATED_ENDPOINT_CONFIG)
    const modelAvailability = await vertexService.checkModelAvailability()
    
    // Extract simple boolean status for backward compatibility
    const simpleStatus = Object.fromEntries(
      Object.entries(modelAvailability).map(([id, status]) => [id, status.available])
    )
    
    return NextResponse.json({
      status: 'ok',
      service: 'dedicated-endpoint',
      models: simpleStatus,
      modelDetails: modelAvailability, // Detailed info including errors
      config: {
        projectId: DEDICATED_ENDPOINT_CONFIG.projectId,
        location: DEDICATED_ENDPOINT_CONFIG.location,
        endpointId: DEDICATED_ENDPOINT_CONFIG.endpointId,
        endpointUrl: DEDICATED_ENDPOINT_CONFIG.endpointUrl,
        hasCredentials: !!DEDICATED_ENDPOINT_CONFIG.credentials
      }
    })
  } catch (error) {
    console.error('Dedicated endpoint health check error:', error)
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}