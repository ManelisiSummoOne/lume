# 🎯 Vertex AI Model vs Endpoint Guide

## Understanding Your Vertex AI Setup

You mentioned having both:
- **Model Registry**: `psychocounsel-llama3-8b-1753218681694`
- **Endpoints**: `psychocounsel-llama3-8b-1753218681694-one-click-deploy`

## 🔍 Which One to Use?

For **deployed models** that are actively serving, you typically need to use the **ENDPOINT ID**, not the model ID.

### Quick Test Methods:

### **Method 1: Run the Test Script**
```bash
node scripts/check-vertex-endpoints.js
```

This will test all possible configurations and tell you which one works.

### **Method 2: Manual Testing in Vercel**

Set your environment variables in Vercel to:
```bash
SERA_MODEL_ID=psychocounsel-llama3-8b-1753218681694-one-click-deploy
```

Then test the health endpoint:
```
https://your-app.vercel.app/api/sera-chat
```

### **Method 3: If Endpoint Doesn't Work**

If the endpoint ID doesn't work, try the model ID:
```bash
SERA_MODEL_ID=psychocounsel-llama3-8b-1753218681694
```

## 🎯 Most Likely Solution

Based on your description, you should use:
```bash
SERA_MODEL_ID=psychocounsel-llama3-8b-1753218681694-one-click-deploy
```

This is the endpoint ID and is what Vertex AI uses for serving deployed models.

## 🔧 Vercel Environment Variables

In your Vercel dashboard, set:

```bash
# Required
GOOGLE_CLOUD_PROJECT_ID=lume-f4327
GOOGLE_CLOUD_LOCATION=us-central1
SERA_MODEL_ID=psychocounsel-llama3-8b-1753218681694-one-click-deploy
SERA_MODEL_NAME=PsychoCounsel LLaMA3 8B

# Optional (for UI)
NEXT_PUBLIC_SERA_MODEL_ID=psychocounsel-llama3-8b-1753218681694-one-click-deploy
NEXT_PUBLIC_SERA_MODEL_NAME=PsychoCounsel LLaMA3 8B
```

## 🚨 Troubleshooting

### If you get "Model not found":
1. ✅ Use endpoint ID: `psychocounsel-llama3-8b-1753218681694-one-click-deploy`
2. ❌ If that fails, try model ID: `psychocounsel-llama3-8b-1753218681694`

### If you get "Permission denied":
- Check that Vertex AI API is enabled
- Verify your project ID is correct
- Make sure the model is deployed and serving

### If you get "Invalid model name":
- Try the full path format:
  ```
  projects/lume-f4327/locations/us-central1/endpoints/psychocounsel-llama3-8b-1753218681694-one-click-deploy
  ```

## ✅ Expected Success Response

When working correctly, the health check should return:
```json
{
  "status": "ok",
  "models": {
    "psychocounsel-llama3-8b-1753218681694-one-click-deploy": true
  },
  "config": {
    "projectId": "lume-f4327",
    "location": "us-central1",
    "hasCredentials": false
  }
}
```

## 🎉 Next Steps

1. **Update your Vercel environment variables** with the endpoint ID
2. **Redeploy** your application  
3. **Test** the health endpoint
4. **Start chatting** with Sera using your model!

The key insight is that Vertex AI uses **endpoints** for serving deployed models, not the original model IDs from the registry.