"use server"

export async function joinWaitlistAction(formData: FormData) {
  // Add a defensive check to ensure formData is a valid FormData instance
  if (!(formData instanceof FormData)) {
    console.error("joinWaitlistAction received invalid formData:", formData)
    return { success: false, message: "Form submission failed: Invalid data received." }
  }

  const email = formData.get("email") as string

  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." }
  }

  // In a real application, you would save the email to a database here.
  console.log(`Simulating waitlist signup for: ${email}`)

  return { success: true, message: `Thank you, ${email}! You've joined the waitlist.` }
}
