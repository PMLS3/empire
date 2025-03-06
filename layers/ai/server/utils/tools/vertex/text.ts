import { VertexAI } from '@google-cloud/vertexai';

export async function generateText(
  projectId: string,
  location: string,
  model: string,
  prompt: string,
  systemPrompt: string = '',
  maxTokens: number = 1024,
  temperature: number = 0.7,
  context: any = {}
) {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  // Initialize Vertex AI
  const vertexAI = new VertexAI({ project: projectId, location: location });
  const generativeModel = vertexAI.getGenerativeModel({ model: model });

  // Build the generation config
  const generationConfig = {
    maxOutputTokens: maxTokens,
    temperature: temperature
  };

  // Prepare the prompt parts
  const parts = [];
  
  // Add system prompt if provided
  if (systemPrompt) {
    parts.push({ text: systemPrompt });
  }
  
  // Add context if provided
  if (context && Object.keys(context).length > 0) {
    parts.push({ text: JSON.stringify(context) });
  }
  
  // Add the main prompt
  parts.push({ text: prompt });

  // Create the request
  const request = {
    contents: [{ role: 'user', parts }],
    generationConfig
  };

  try {
    // Generate the text
    const response = await generativeModel.generateContent(request);
    const result = await response.response;
    
    // Extract the text from the response
    const generatedText = result.candidates[0].content.parts[0].text;
    
    return generatedText;
  } catch (error) {
    console.error('Error generating text with Vertex AI:', error);
    throw error;
  }
}
