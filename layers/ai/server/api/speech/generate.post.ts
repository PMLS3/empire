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
      text,
      voiceName = 'en-US-Neural2-F', // Default voice
      languageCode = 'en-US',
      speakingRate = 1.0,
      pitch = 0.0,
      volumeGainDb = 0.0,
      effectsProfileId = [],
      outputFormat = 'MP3',
    } = body;

    if (!text) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Text is required',
      });
    }

    // Import dynamically to prevent server-side issues
    const { generateSpeech } = await import('../../utils/tools/vertex/audio');
    
    const audioContent = await generateSpeech(
      process.env.GOOGLE_CLOUD_PROJECT_ID || '',
      'us-central1',
      text,
      voiceName,
      languageCode,
      speakingRate,
      pitch,
      volumeGainDb,
      effectsProfileId,
      outputFormat
    );

    // In a real implementation, we would store the audio file
    // and return a URL to the stored file
    
    // For now, we'll return the base64-encoded audio content
    return {
      audioContent,
      voiceName,
      languageCode,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Speech generation error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error generating speech',
    });
  }
});
