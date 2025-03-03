import { VertexAI } from '@google-cloud/vertexai';
import { promises as fs } from 'fs';

async function getBase64FromFile(filepath: string) {
  try {
    const data = await fs.readFile(filepath);
    return data.toString('base64');
  } catch (error) {
    console.error(`Error reading file ${filepath}:`, error);
    throw new Error(`Failed to read file ${filepath}`);
  }
}

/**
 * TODO(developer): Update these variables before running the sample.
 */
export async function sendMultiModalPromptWithImage(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-1.5-flash-001',
  filepaths: string[],
  text: string
) {
  try {
    console.log('[sendMultiModalPromptWithImage] Reading files:', filepaths);
    const images = await Promise.all(filepaths.map(filepath => getBase64FromFile(filepath)));
    console.log('[sendMultiModalPromptWithImage] Successfully read files');

    const vertexAI = new VertexAI({ project: projectId, location: location });

    const generativeVisionModel = vertexAI.getGenerativeModel({ model: model });

    const request = {
      contents: [
        {
          role: 'user',
          parts: images.map(image => [
            {
              inlineData: {
                data: image,
                mimeType: 'image/jpeg', // Most screenshots will be JPEG
              },
            },
            {
              text: text,
            }
          ]).flat(),
        },
      ],
    };

    console.log('[sendMultiModalPromptWithImage] Sending request to Vertex AI');
    const response: any = await generativeVisionModel.generateContent(request);
    const aggregatedResponse: any = await response.response;

    console.log('[sendMultiModalPromptWithImage] Got response from Vertex AI');
    const fullTextResponse = aggregatedResponse.candidates[0].content.parts
      .map((part: any) => part.text)
      .join('\n')
      .trim();
    console.log('[sendMultiModalPromptWithImage] Full text response:', fullTextResponse);
    
    console.log('METADATA', response.usageMetadata)
    const usageMetadata = {
      promptTokenCount: response.usageMetadata?.promptTokenCount || 0,
      candidatesTokenCount: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokenCount: response.usageMetadata?.totalTokenCount || 0,
    };

    return {
      fullTextResponse,
      usageMetadata,
    };
  } catch (error) {
    console.error('[sendMultiModalPromptWithImage] Error:', error);
    throw new Error('Failed to generate content');
  }
}
