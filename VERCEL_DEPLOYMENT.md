# Deploy to Vercel with Vertex AI Integration

## 🚀 Quick Vercel Deployment Guide

### Step 1: Set Environment Variables in Vercel

In your Vercel dashboard:

1. **Go to your project settings**
2. **Navigate to "Environment Variables"**
3. **Add these variables:**

```bash
# Required - Your Google Cloud Project ID
GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id

# Required - Region where your model is deployed
GOOGLE_CLOUD_LOCATION=europe-west4

# Required - Your dedicated endpoint configuration
SERA_MODEL_ID=2159768491417141248
SERA_MODEL_NAME=PsychoCounsel LLaMA3 8B
SERA_ENDPOINT_URL=https://2159768491417141248.europe-west4-1075430485377.prediction.vertexai.goog

# Optional - For UI display (client-side)
NEXT_PUBLIC_SERA_MODEL_ID=2159768491417141248
NEXT_PUBLIC_SERA_MODEL_NAME=PsychoCounsel LLaMA3 8B
```

### Step 2: Authentication (Automatic for Vercel)

✅ **No additional authentication setup needed!**

Vercel automatically handles Google Cloud authentication when you set the project ID. This is called "Default Application Credentials."

### Step 3: Deploy

```bash
# Deploy to Vercel
vercel --prod

# Or push to your connected GitHub repo
git push origin main
```

### Step 4: Test Your Deployment

1. **Health Check**: Visit `https://your-app.vercel.app/api/sera-chat`
   - Should return: `{"status":"ok","models":{...}}`

2. **Test Chat**: 
   - Try text input
   - Try voice input (if microphone permissions granted)
   - Check voice output (if enabled)

## ✅ Complete Integration Verification

Your Vertex AI model integration includes:

### **Input Methods** ✅
- **Text Input**: Type messages → Vertex AI model
- **Voice Input**: Speak → STT → Vertex AI model

### **Output Methods** ✅  
- **Text Output**: Vertex AI model → Text display
- **Voice Output**: Vertex AI model → TTS → Audio playback

### **Context Passing** ✅
- User mood from mood selector
- Conversation history
- Streaming responses
- Real-time model status

## 🔧 Troubleshooting

### Common Vercel Issues:

**1. Environment Variables Not Found**
```
Error: Missing GOOGLE_CLOUD_PROJECT_ID
```
**Solution**: Double-check environment variables in Vercel dashboard

**2. Model Not Available**
```
Error: Model your-model-id not available
```
**Solution**: 
- Verify model ID is correct
- Check region matches where model is deployed
- Ensure Vertex AI API is enabled in your project

**3. Authentication Errors**
```
Error: Could not load default credentials
```
**Solution**: 
- This usually resolves automatically on Vercel
- If persists, try redeploying

### Test Commands:

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/sera-chat

# Expected response:
{
  "status": "ok",
  "models": {
    "your-model-id": true
  },
  "config": {
    "projectId": "your-project-id",
    "location": "us-central1",
    "hasCredentials": false
  }
}
```

## 🎯 Success Indicators

- ✅ Health check returns `"status": "ok"`
- ✅ Model indicator shows "Online" status
- ✅ Text chat works with your model
- ✅ Voice input → transcription → your model
- ✅ Your model response → TTS (if voice mode enabled)
- ✅ Console logs show your model ID being used

Your Sera is now fully integrated with your deployed Vertex AI model! 🎉