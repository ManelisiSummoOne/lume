import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided for TTS." }, { status: 400 })
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
    const elevenLabsVoiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM" // Default voice if not set
    
    console.log("TTS API called with text:", text)
    console.log("API Key present:", !!elevenLabsApiKey)
    console.log("Voice ID:", elevenLabsVoiceId)
    
    if (!elevenLabsApiKey) {
      console.error("ELEVENLABS_API_KEY is not set.")
      return NextResponse.json({ error: "ELEVENLABS_API_KEY is not set." }, { status: 500 })
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenLabsApiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2", // Or another suitable model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    console.log("ElevenLabs response status:", response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error("Eleven Labs TTS Error:", errorData)
      return NextResponse.json({ error: "Failed to generate speech.", details: errorData }, { status: response.status })
    }

    // Stream the audio directly back to the client
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error in /api/tts:", error)
    return NextResponse.json({ error: "Failed to process text to speech." }, { status: 500 })
  }
}
