import { defineEventHandler, readBody, createError } from 'h3';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = await getServerSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    const body = await readBody(event);
    const {
      prompt,
      model = 'imagegeneration@005', // Default model
      negativePrompt = '',
      sampleCount = 1,
      height = 1024,
      width = 1024,
      style = 'photographic', // Options: photographic, vivid, icon
      project_id = process.env.GOOGLE_CLOUD_PROJECT_ID || '',
      location = 'us-central1',
    } = body;

    if (!prompt) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Prompt is required',
      });
    }

    // Import dynamically to prevent server-side issues
    const { generateImage } = await import('../../utils/tools/vertex/image');
    
    const images = await generateImage(
      project_id,
      location,
      model,
      prompt,
      negativePrompt,
      sampleCount,
      width,
      height,
      style
    );

    return {
      images,
      model,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Image generation error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error generating image',
    });
  }
});
