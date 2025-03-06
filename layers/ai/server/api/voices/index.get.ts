import { defineEventHandler, getQuery, createError } from 'h3';
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
    const query = getQuery(event);
    const { languageCode = '' } = query;

    // Import dynamically to prevent server-side issues
    const { listVoices } = await import('../../utils/tools/vertex/audio');
    
    const voices = await listVoices(languageCode as string);

    return {
      voices,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error listing voices:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error listing voices',
    });
  }
});
