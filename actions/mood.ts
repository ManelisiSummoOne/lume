"use server"

interface MoodEntry {
  mood: string
  intensity: number
  timestamp: Date
  sessionId?: string
}

// In a real application, this would connect to your database
// For now, we'll simulate database operations
export async function saveMoodEntry(mood: string, intensity: number, sessionId?: string) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const moodEntry: MoodEntry = {
      mood,
      intensity,
      timestamp: new Date(),
      sessionId,
    }

    // In a real app, you would save to your database here
    // Example with Supabase:
    // const { data, error } = await supabase
    //   .from('mood_entries')
    //   .insert([moodEntry])

    console.log("Mood entry saved:", moodEntry)

    return {
      success: true,
      message: `Mood "${mood}" with intensity ${intensity} saved successfully!`,
      data: moodEntry,
    }
  } catch (error) {
    console.error("Error saving mood entry:", error)
    return {
      success: false,
      message: "Failed to save mood entry. Please try again.",
    }
  }
}

export async function getMoodHistory(sessionId?: string, limit = 10) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In a real app, you would fetch from your database here
    // Example with Supabase:
    // const { data, error } = await supabase
    //   .from('mood_entries')
    //   .select('*')
    //   .eq('session_id', sessionId)
    //   .order('timestamp', { ascending: false })
    //   .limit(limit)

    // Mock data for demonstration
    const mockHistory: MoodEntry[] = [
      { mood: "calm", intensity: 7, timestamp: new Date(Date.now() - 86400000) },
      { mood: "hopeful", intensity: 8, timestamp: new Date(Date.now() - 172800000) },
    ]

    return {
      success: true,
      data: mockHistory,
    }
  } catch (error) {
    console.error("Error fetching mood history:", error)
    return {
      success: false,
      message: "Failed to fetch mood history.",
    }
  }
}
