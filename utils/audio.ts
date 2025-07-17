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
