// utils/audio.ts
export async function playAudioStream(audioStream: ReadableStream<Uint8Array>): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting audio playback...')
      
      // Read the stream first
      const reader = audioStream.getReader()
      const chunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      console.log('Audio chunks received:', chunks.length)
      
      // Create audio blob and URL
      const audioBlob = new Blob(chunks, { type: "audio/mpeg" })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      console.log('Audio blob created, size:', audioBlob.size)
      
      // Use HTML5 Audio API instead of Web Audio API for better compatibility
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        console.log('Audio playback ended')
        URL.revokeObjectURL(audioUrl)
        resolve()
      }
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error)
        URL.revokeObjectURL(audioUrl)
        reject(error)
      }
      
      audio.oncanplaythrough = () => {
        console.log('Audio can play through, starting playback')
        audio.play().catch(reject)
      }
      
      // Load the audio
      audio.load()
      
    } catch (error) {
      console.error('Error in playAudioStream:', error)
      reject(error)
    }
  })
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
