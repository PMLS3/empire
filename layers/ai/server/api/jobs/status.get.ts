import { defineEventHandler, createError } from 'h3';
import { getServerSession } from '#auth';
import { getJobStats } from '../../utils/jobProcessor';

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
    // Only allow admin users to view job stats
    if (!session.user.isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to view job stats',
      });
    }
    
    return getJobStats();
  } catch (error) {
    console.error('Job stats error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error fetching job stats',
    });
  }
});
