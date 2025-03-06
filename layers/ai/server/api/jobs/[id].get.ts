import { defineEventHandler, createError } from 'h3';
import { getServerSession } from '#auth';
import { getJob } from '../../utils/jobQueue';

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
    const jobId = event.context.params?.id;
    
    if (!jobId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job ID is required',
      });
    }
    
    // Get job
    const job = await getJob(jobId);
    
    if (!job) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Job not found',
      });
    }
    
    // Check ownership
    if (job.owner_id !== session.user.id && job.workspace_id !== session.currentWorkspace?.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to view this job',
      });
    }
    
    return job;
  } catch (error) {
    console.error('Job fetch error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error fetching job',
    });
  }
});
