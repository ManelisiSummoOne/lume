# Sera Vertex AI Integration Setup

This guide explains how to set up Sera with your deployed Vertex AI model for mental health conversations.

## Overview

Sera now uses your custom Vertex AI model deployed to Google Cloud for:

- Mental health conversations and emotional support
- Therapeutic guidance and coping strategies
- Personalized responses based on user mood and context

## Prerequisites

1. Google Cloud Project with Vertex AI API enabled
2. Your custom model deployed and available in Vertex AI
3. Appropriate authentication set up

## Environment Configuration

### 1. Copy the environment template
```bash
cp .env.example .env.local
```

### 2. Set your environment variables

```bash
# Required: Your Google Cloud Project ID
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Required: The region where your model is deployed
GOOGLE_CLOUD_LOCATION=us-central1

# Required: Your deployed model configuration
SERA_MODEL_ID=your-deployed-model-id
SERA_MODEL_NAME="Your Model Name"

# Optional: For UI display
NEXT_PUBLIC_SERA_MODEL_ID=your-deployed-model-id
NEXT_PUBLIC_SERA_MODEL_NAME="Your Model Name"

# Optional: Service Account Key (see authentication section below)
# GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

## Authentication Options

### Option 1: Default Application Credentials (Recommended for Cloud Deployment)

If you're deploying on Google Cloud (Cloud Run, GKE, etc.), no additional authentication is needed. The application will use the default service account.

### Option 2: Service Account Key (Local Development)

1. Create a service account in your Google Cloud Console
2. Grant it the "Vertex AI User" role
3. Generate a JSON key file
4. Set the `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable to the JSON content as a string

```bash
# Example (replace with your actual key)
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

### Option 3: gcloud CLI (Local Development)

```bash
gcloud auth application-default login
```

## How It Works

Your deployed Vertex AI model handles all types of mental health conversations:

- **General Support**: Everyday emotional check-ins and conversations
- **Therapeutic Guidance**: Coping strategies and mental health advice
- **Crisis Awareness**: Sensitive to urgent situations and can provide appropriate responses

### User Context Integration
- User mood is passed to the model to provide context
- Conversation history is maintained for continuity
- System prompts are customized based on user emotional state

## Testing the Integration

### 1. Health Check
Visit `https://your-domain/api/sera-chat` (GET request) to check model availability.

### 2. Test Your Model

Try different types of conversations:

**Basic Conversations:**
- "Hi Sera, how are you?"
- "I'm feeling okay today"
- "Tell me about yourself"

**Emotional Support:**
- "I need help with anxiety"
- "Can you guide me through some coping strategies?"
- "I'm feeling stressed about work"

**Crisis Situations:**
- "I'm having a panic attack"
- "I can't cope with this anymore"
- "I need help right now"

## Monitoring

The Sera Model Indicator component (visible in the right panel on desktop) shows:
- Your deployed model availability status
- Real-time model health check
- Configuration details (project, region)
- Model information and description

## Troubleshooting

### Common Issues

1. **"Missing GOOGLE_CLOUD_PROJECT_ID" error**
   - Ensure the environment variable is set correctly
   - Check that your `.env.local` file is in the project root

2. **Authentication errors**
   - Verify your service account has Vertex AI permissions
   - Check that the JSON key is properly formatted (no extra spaces/newlines)
   - For local development, try using `gcloud auth application-default login`

3. **Model not available**
   - Verify the model IDs match your Vertex AI deployment
   - Check that models are deployed in the specified region
   - Ensure Vertex AI API is enabled in your project

4. **Streaming issues**
   - Check browser console for errors
   - Verify network connectivity to your deployment
   - Test the health check endpoint

### Debugging

Enable debug logging by checking the browser console and server logs. The application logs:
- Selected model for each request
- Input analysis results
- Model availability status
- Streaming errors

## Advanced Configuration

### Custom Model Selection

You can modify the model selection logic in `lib/vertex-ai-config.ts`:
- Add new trigger keywords
- Adjust urgency/complexity thresholds
- Customize system prompts for each model

### Model Parameters

Adjust generation parameters in `lib/vertex-ai-service.ts`:
- `temperature`: Creativity level (0.0-1.0)
- `topP`: Nucleus sampling parameter
- `topK`: Top-k sampling parameter
- `maxOutputTokens`: Maximum response length

## Security Notes

- Never commit `.env.local` or service account keys to version control
- Use environment-specific configurations for different deployments
- Regularly rotate service account keys
- Monitor usage and costs in Google Cloud Console

## Support

If you encounter issues:
1. Check the health check endpoint first
2. Review browser console and server logs
3. Verify environment configuration
4. Test with simple inputs before complex ones
5. Ensure your Vertex AI models are properly deployed and accessible