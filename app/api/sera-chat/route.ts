import { NextRequest, NextResponse } from 'next/server'
import { getVertexAIService } from '../../../lib/vertex-ai-service'
import type { ChatMessage } from '../../../lib/vertex-ai-service'

// Environment configuration for Vertex AI
const VERTEX_AI_CONFIG = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.PROJECT_ID || '',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  // If you have service account credentials as a JSON string
  credentials: process.env.GOOGLE_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    : undefined
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userMood } = await req.json()

    // Validate required environment variables
    if (!VERTEX_AI_CONFIG.projectId) {
      console.error('Missing GOOGLE_CLOUD_PROJECT_ID environment variable')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
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

    // Get or initialize the Vertex AI service
    const vertexService = getVertexAIService(VERTEX_AI_CONFIG)

    // Generate response using intelligent model selection
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
    console.error('Error in /api/sera-chat:', error)
    
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

// Health check endpoint
export async function GET(req: NextRequest) {
  try {
    if (!VERTEX_AI_CONFIG.projectId) {
      return NextResponse.json(
        { status: 'error', message: 'Missing configuration' },
        { status: 500 }
      )
    }

    const vertexService = getVertexAIService(VERTEX_AI_CONFIG)
    const modelAvailability = await vertexService.checkModelAvailability()
    
    // Extract simple boolean status for backward compatibility
    const simpleStatus = Object.fromEntries(
      Object.entries(modelAvailability).map(([id, status]) => [id, status.available])
    )
    
    return NextResponse.json({
      status: 'ok',
      models: simpleStatus,
      modelDetails: modelAvailability, // Detailed info including errors
      config: {
        projectId: VERTEX_AI_CONFIG.projectId,
        location: VERTEX_AI_CONFIG.location,
        hasCredentials: !!VERTEX_AI_CONFIG.credentials
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}