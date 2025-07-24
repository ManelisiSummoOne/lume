// Script to check Vertex AI endpoints and models
// Run with: node scripts/check-vertex-endpoints.js

const { VertexAI } = require('@google-cloud/vertexai');

async function checkEndpoints() {
  const projectId = 'lume-f4327';
  const location = 'us-central1';
  
  console.log('🔍 Checking Vertex AI Endpoints and Models...');
  console.log(`Project: ${projectId}`);
  console.log(`Location: ${location}`);
  console.log('---');

  // Test different possible model/endpoint configurations
  const testCases = [
    {
      name: 'Original Model ID',
      id: 'psychocounsel-llama3-8b-1753218681694'
    },
    {
      name: 'Endpoint with one-click-deploy',
      id: 'psychocounsel-llama3-8b-1753218681694-one-click-deploy'
    },
    {
      name: 'Full endpoint path format',
      id: `projects/${projectId}/locations/${location}/endpoints/psychocounsel-llama3-8b-1753218681694-one-click-deploy`
    },
    {
      name: 'Full model path format',
      id: `projects/${projectId}/locations/${location}/models/psychocounsel-llama3-8b-1753218681694`
    }
  ];

  const vertexAI = new VertexAI({
    project: projectId,
    location: location,
  });

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`ID: ${testCase.id}`);
    
    try {
      // Try to create model with minimal config
      const model = vertexAI.getGenerativeModel({
        model: testCase.id,
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.5,
        },
      });

      console.log('✅ Model object created successfully');

      // Try a simple test
      const result = await model.generateContent({
        contents: [{ 
          role: 'user', 
          parts: [{ text: 'Hello, please respond with just "Hi" to test the connection.' }] 
        }]
      });

      const response = result.response.text();
      console.log(`✅ SUCCESS! Model responded: "${response}"`);
      console.log(`🎯 USE THIS ID: ${testCase.id}`);
      break; // Stop testing once we find a working one

    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      
      if (error.message.includes('not found')) {
        console.log('   → Model/endpoint not found');
      } else if (error.message.includes('permission')) {
        console.log('   → Permission denied');
      } else if (error.message.includes('Invalid model name')) {
        console.log('   → Invalid model name format');
      } else {
        console.log(`   → Error: ${error.message}`);
      }
    }
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Copy the working ID from above');
  console.log('2. Update your environment variable: SERA_MODEL_ID=<working-id>');
  console.log('3. Redeploy your application');
  console.log('\n💡 Tip: Endpoints are usually the correct choice for deployed models');
}

checkEndpoints().catch(console.error);