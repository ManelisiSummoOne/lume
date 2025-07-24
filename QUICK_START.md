# Quick Start: Single Vertex AI Model Integration

## 🚀 Get Your Deployed Model Working with Sera in 5 Minutes

### Step 1: Set Environment Variables

Create a `.env.local` file in your project root:

```bash
# Your Google Cloud Project ID
GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id

# Region where your model is deployed
GOOGLE_CLOUD_LOCATION=us-central1

# Your deployed model ID (the exact ID from Vertex AI)
SERA_MODEL_ID=your-deployed-model-id

# Optional: Custom name for your model
SERA_MODEL_NAME=My Sera Model
```

### Step 2: Authentication

Choose one option:

**Option A: Cloud Deployment (Recommended)**
- If deploying to Google Cloud, no additional setup needed

**Option B: Local Development with gcloud**
```bash
gcloud auth application-default login
```

**Option C: Service Account Key**
```bash
# Add to .env.local
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...",...}'
```

### Step 3: Test the Integration

1. **Start the development server:**
```bash
npm run dev
```

2. **Check model health:**
Visit: `http://localhost:3000/api/sera-chat`

3. **Test conversations:**
- Open the main page
- Try different types of messages
- Check the model indicator in the right panel (desktop)

### Step 4: Verify It's Working

**Success indicators:**
- ✅ Health check returns `{"status":"ok"}`
- ✅ Sera responds using your deployed model
- ✅ Model indicator shows "Online" status
- ✅ Console logs show your model ID being used

**Common issues:**
- ❌ `Missing GOOGLE_CLOUD_PROJECT_ID` → Check your `.env.local`
- ❌ `Model not available` → Verify model ID and region
- ❌ Authentication errors → Check credentials setup

### Your Model is Now Integrated! 🎉

Sera will now use your deployed Vertex AI model for all conversations, with:
- User mood context passed to your model
- Conversation history maintained
- Streaming responses for real-time chat
- Automatic error handling and fallbacks

---

**Need help?** See the full [SERA_VERTEX_AI_SETUP.md](./SERA_VERTEX_AI_SETUP.md) guide for detailed configuration options and troubleshooting.