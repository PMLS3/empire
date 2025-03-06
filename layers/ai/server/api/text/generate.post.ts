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
      model = 'gemini-1.5-pro', // Default model
      maxTokens = 1024,
      temperature = 0.7,
      format = 'script', // Options: script, outline, story
      context = {},
    } = body;

    if (!prompt) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Prompt is required',
      });
    }

    // Create prompt template based on format
    let systemPrompt = '';
    
    if (format === 'script') {
      systemPrompt = `Create a professional video script based on the following prompt. 
      The script should include:
      - Introduction that hooks the viewer
      - Clear sections with headings
      - Engaging dialogue with speaker cues
      - Visual scene descriptions in [brackets]
      - A strong call-to-action at the end
      
      Format this as a professional script, not just a rough outline.`;
    } else if (format === 'outline') {
      systemPrompt = `Create a structured outline for a video based on the following prompt.
      Include:
      - Key points to cover
      - Suggested structure with timing for each section
      - Bullet points for important details
      - Notes on visuals or graphics needed`;
    } else if (format === 'story') {
      systemPrompt = `Create an engaging narrative story for a video based on the following prompt.
      The story should have:
      - A compelling opening hook
      - Character development if applicable
      - A clear narrative arc with beginning, middle, and end
      - Emotional elements to connect with viewers`;
    }

    // Import dynamically to prevent server-side issues
    const { generateText } = await import('../../utils/tools/vertex/text');
    
    const result = await generateText(
      process.env.GOOGLE_CLOUD_PROJECT_ID || '',
      'us-central1',
      model,
      prompt,
      systemPrompt,
      maxTokens,
      temperature,
      context
    );

    return {
      text: result,
      model,
      format,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Text generation error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error generating text',
    });
  }
});
