import { defineEventHandler, readBody, createError } from 'h3';
import { getServerSession } from '#auth';
import { createJob, JobType } from '../../utils/jobQueue';
import { startJobProcessor } from '../../utils/jobProcessor';

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
    const { type, data, priority = 3 } = body;
    
    // Validate job type
    if (!type || !['text-generation', 'speech-synthesis', 'image-generation', 'video-rendering'].includes(type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid job type',
      });
    }
    
    // Validate job data
    if (!data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job data is required',
      });
    }
    
    // Get user and workspace info
    const ownerId = session.user.id;
    const workspaceId = session.currentWorkspace?.id;
    
    if (!workspaceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No active workspace',
      });
    }
    
    // Create job
    const jobId = await createJob(
      type as JobType,
      data,
      ownerId,
      workspaceId,
      priority
    );
    
    // Ensure processor is running
    startJobProcessor();
    
    return {
      jobId,
      status: 'pending',
    };
  } catch (error) {
    console.error('Job creation error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error creating job',
    });
  }
});
