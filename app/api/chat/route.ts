import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const result = await streamText({
      model: google("gemini-pro"), // You can also try "gemini-1.5-flash" or "gemini-1.5-pro"
      messages,
    })

    // Corrected: Use toDataStreamResponse() for streaming text back to the client
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in /api/chat:", error)
    return NextResponse.json({ error: "Failed to generate text from AI." }, { status: 500 })
  }
}
