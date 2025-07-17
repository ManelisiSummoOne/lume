import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 })
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
    if (!elevenLabsApiKey) {
      throw new Error("ELEVENLABS_API_KEY is not set.")
    }

    const sttFormData = new FormData()
    sttFormData.append("audio", audioFile, audioFile.name || "recording.wav")
    sttFormData.append("model_id", "eleven_multilingual_v2") // Or another suitable model

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsApiKey,
      },
      body: sttFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Eleven Labs STT Error:", errorData)
      return NextResponse.json({ error: "Failed to transcribe audio." }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ text: data.text })
  } catch (error) {
    console.error("Error in /api/stt:", error)
    return NextResponse.json({ error: "Failed to process speech to text." }, { status: 500 })
  }
}
