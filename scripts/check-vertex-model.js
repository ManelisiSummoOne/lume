// Script to check Vertex AI model status
// Run with: node scripts/check-vertex-model.js

const { VertexAI } = require('@google-cloud/vertexai');

async function checkModel() {
  const projectId = 'lume-f4327';
  const location = 'us-central1';
  const modelId = 'psychocounsel-llama3-8b-1753218681694';

  console.log('🔍 Checking Vertex AI Model Status...');
  console.log(`Project: ${projectId}`);
  console.log(`Location: ${location}`);
  console.log(`Model ID: ${modelId}`);
  console.log('---');

  try {
    const vertexAI = new VertexAI({
      project: projectId,
      location: location,
    });

    console.log('✅ VertexAI client initialized');

    // Try to get the model
    const model = vertexAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    console.log('✅ Model object created');

    // Try a simple test
    const testPrompt = 'Hello, this is a test. Please respond briefly.';
    console.log(`🧪 Testing with prompt: "${testPrompt}"`);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: testPrompt }] }],
    });

    console.log('✅ Model responded successfully!');
    console.log('Response:', result.response.text());

  } catch (error) {
    console.error('❌ Error testing model:', error.message);
    
    if (error.message.includes('not found')) {
      console.log('\n🔍 Possible Issues:');
      console.log('1. Model ID might be incorrect');
      console.log('2. Model might not be deployed in this region');
      console.log('3. Model might be in a different project');
      console.log('4. Model deployment might have failed');
    } else if (error.message.includes('permission')) {
      console.log('\n🔍 Permission Issues:');
      console.log('1. Check if Vertex AI API is enabled');
      console.log('2. Verify service account has Vertex AI User role');
      console.log('3. Check if model is accessible to your credentials');
    } else {
      console.log('\n🔍 Other Issues:');
      console.log('1. Model might be starting up (try again in a few minutes)');
      console.log('2. Model configuration might be incompatible');
      console.log('3. Check Vertex AI console for model status');
    }
  }
}

checkModel();