// utils/audio.ts
export async function playAudioStream(audioStream: ReadableStream<Uint8Array>) {
  try {
    console.log("Starting audio stream playback...")
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Resume audio context if suspended (required for autoplay policies)
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
    
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

    console.log(`Received ${chunks.length} audio chunks`)
    const audioBlob = new Blob(chunks, { type: "audio/mpeg" })
    const arrayBuffer = await audioBlob.arrayBuffer()
    console.log(`Audio buffer size: ${arrayBuffer.byteLength} bytes`)

    return new Promise<void>((resolve, reject) => {
      audioContext.decodeAudioData(arrayBuffer, 
        (buffer) => {
          console.log("Audio decoded successfully, playing...")
          source.buffer = buffer
          source.onended = () => {
            console.log("Audio playback completed")
            resolve()
          }
          source.start(0)
        },
        (error) => {
          console.error("Audio decode error:", error)
          reject(error)
        }
      )
    })
  } catch (error) {
    console.error("Audio stream playback error:", error)
    throw error
  }
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
      console.log("Setting up speech synthesis for:", text.substring(0, 50) + "...")
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure voice settings for a more pleasant experience
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8

      // Try to use a female voice if available
      const voices = speechSynthesis.getVoices()
      console.log("Available voices:", voices.length)
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('sara') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('anna')
      )
      
      if (femaleVoice) {
        console.log("Using female voice:", femaleVoice.name)
        utterance.voice = femaleVoice
      } else {
        console.log("No female voice found, using default")
      }

      utterance.onstart = () => console.log("Speech synthesis started")
      utterance.onend = () => {
        console.log("Speech synthesis completed")
        resolve()
      }
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      console.log("Starting speech synthesis...")
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

// Browser-only speech synthesis (simplified wrapper)
export async function speakTextWithFallback(text: string): Promise<void> {
  return speakText(text)
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
