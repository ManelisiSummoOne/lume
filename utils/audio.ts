// utils/audio.ts
export async function playAudioStream(audioStream: ReadableStream<Uint8Array>) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const source = audioContext.createBufferSource()
  const gainNode = audioContext.createGain()

  gainNode.connect(audioContext.destination)
  source.connect(gainNode)

  const reader = audioStream.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const audioBlob = new Blob(chunks, { type: "audio/mpeg" })
  const arrayBuffer = await audioBlob.arrayBuffer()

  audioContext.decodeAudioData(arrayBuffer, (buffer) => {
    source.buffer = buffer
    source.start(0)
  })
}

// Fallback speech synthesis using browser's built-in API
export function speakText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported in this browser'))
      return
    }

    // Function to set up and speak
    const setupAndSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure voice settings for a more pleasant experience
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8

      // Try to use a female voice if available
      const voices = speechSynthesis.getVoices()
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('sara') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('anna')
      )
      
      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))

      speechSynthesis.speak(utterance)
    }

    // Check if voices are already loaded
    const voices = speechSynthesis.getVoices()
    if (voices.length > 0) {
      setupAndSpeak()
    } else {
      // Wait for voices to load
      speechSynthesis.addEventListener('voiceschanged', setupAndSpeak, { once: true })
      // Fallback timeout in case voiceschanged never fires
      setTimeout(setupAndSpeak, 100)
    }
  })
}

// Combined function that tries ElevenLabs TTS first, then falls back to browser speech
export async function speakTextWithFallback(text: string): Promise<void> {
  try {
    // Try ElevenLabs TTS first
    const ttsResponse = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (ttsResponse.ok && ttsResponse.body) {
      await playAudioStream(ttsResponse.body)
      return
    }
  } catch (error) {
    console.warn("ElevenLabs TTS failed, falling back to browser speech synthesis:", error)
  }

  // Fallback to browser speech synthesis
  try {
    await speakText(text)
  } catch (error) {
    console.error("Both TTS methods failed:", error)
    throw error
  }
}

export async function recordAudio(): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" })
        resolve(audioBlob)
      }

      mediaRecorder.onerror = (event) => {
        reject(event.error)
      }

      mediaRecorder.start()
    } catch (error) {
      reject(error)
    }
  })
}
