import {
  Job,
  JobType,
  getNextPendingJob,
  startProcessingJob,
  completeJob,
  failJob,
  updateJobProgress
} from './jobQueue';

// Import job handlers
import { generateText } from './tools/vertex/text';
import { generateImage } from './tools/vertex/image';
import { generateSpeech } from './tools/vertex/audio';
import { renderVideo } from './tools/ffmpeg/renderer';

// Processor state
let isRunning = false;
const activeJobs: Record<JobType, Set<string>> = {
  'text-generation': new Set(),
  'speech-synthesis': new Set(),
  'image-generation': new Set(),
  'video-rendering': new Set(),
};

// Maximum concurrent jobs by type
const maxConcurrentJobs: Record<JobType, number> = {
  'text-generation': 5,
  'speech-synthesis': 3,
  'image-generation': 2,
  'video-rendering': 1,
};

/**
 * Process a specific job
 */
async function processJob(job: Job): Promise<void> {
  console.log(`[JobProcessor] Processing job ${job.id} of type ${job.type}`);
  
  try {
    // Mark job as processing
    await startProcessingJob(job.id);
    
    // Add to active jobs
    activeJobs[job.type].add(job.id);
    
    // Process based on job type
    switch (job.type) {
      case 'text-generation':
        await processTextGenerationJob(job);
        break;
        
      case 'speech-synthesis':
        await processSpeechSynthesisJob(job);
        break;
        
      case 'image-generation':
        await processImageGenerationJob(job);
        break;
        
      case 'video-rendering':
        await processVideoRenderingJob(job);
        break;
        
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
    
  } catch (error) {
    console.error(`[JobProcessor] Error processing job ${job.id}:`, error);
    await failJob(job.id, error.message || 'Unknown error');
  } finally {
    // Remove from active jobs
    activeJobs[job.type].delete(job.id);
  }
}

/**
 * Process a text generation job
 */
async function processTextGenerationJob(job: Job): Promise<void> {
  const { prompt, model, systemPrompt, maxTokens, temperature, context } = job.data;
  
  try {
    const result = await generateText(
      process.env.GOOGLE_CLOUD_PROJECT_ID,
      'us-central1',
      model || 'gemini-1.5-pro',
      prompt,
      systemPrompt,
      maxTokens,
      temperature,
      context
    );
    
    await completeJob(job.id, { text: result });
  } catch (error) {
    console.error(`[JobProcessor] Error in text generation job ${job.id}:`, error);
    throw error;
  }
}

/**
 * Process a speech synthesis job
 */
async function processSpeechSynthesisJob(job: Job): Promise<void> {
  const {
    text,
    voiceName,
    languageCode,
    speakingRate,
    pitch,
    volumeGainDb,
    effectsProfileId,
    outputFormat
  } = job.data;
  
  try {
    const audioContent = await generateSpeech(
      process.env.GOOGLE_CLOUD_PROJECT_ID,
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
    
    await completeJob(job.id, { audioContent });
  } catch (error) {
    console.error(`[JobProcessor] Error in speech synthesis job ${job.id}:`, error);
    throw error;
  }
}

/**
 * Process an image generation job
 */
async function processImageGenerationJob(job: Job): Promise<void> {
  const {
    prompt,
    model,
    negativePrompt,
    sampleCount,
    width,
    height,
    style
  } = job.data;
  
  try {
    const images = await generateImage(
      process.env.GOOGLE_CLOUD_PROJECT_ID,
      'us-central1',
      model || 'imagegeneration@005',
      prompt,
      negativePrompt,
      sampleCount,
      width,
      height,
      style
    );
    
    await completeJob(job.id, { images });
  } catch (error) {
    console.error(`[JobProcessor] Error in image generation job ${job.id}:`, error);
    throw error;
  }
}

/**
 * Process a video rendering job
 * Uses progress reporting since this can be a long operation
 */
async function processVideoRenderingJob(job: Job): Promise<void> {
  const { settings, videoAssets, audioAssets, outputFormat } = job.data;
  
  try {
    const result = await renderVideo(
      settings,
      videoAssets,
      audioAssets,
      outputFormat,
      // Progress callback
      async (progress: number) => {
        await updateJobProgress(job.id, progress);
      }
    );
    
    await completeJob(job.id, { url: result.url, duration: result.duration });
  } catch (error) {
    console.error(`[JobProcessor] Error in video rendering job ${job.id}:`, error);
    throw error;
  }
}

/**
 * Check for and process pending jobs
 */
async function processPendingJobs(): Promise<void> {
  if (!isRunning) return;
  
  try {
    // Process each job type
    for (const jobType of Object.keys(activeJobs) as JobType[]) {
      // Check if we have capacity for this job type
      if (activeJobs[jobType].size < maxConcurrentJobs[jobType]) {
        // Get the next pending job
        const job = await getNextPendingJob(jobType);
        
        if (job) {
          // Process in the background
          processJob(job).catch(error => {
            console.error(`[JobProcessor] Background job processing error:`, error);
          });
        }
      }
    }
  } catch (error) {
    console.error('[JobProcessor] Error processing pending jobs:', error);
  }
  
  // Schedule next check
  if (isRunning) {
    setTimeout(processPendingJobs, 5000); // Check every 5 seconds
  }
}

/**
 * Start the job processor
 */
export function startJobProcessor(): void {
  if (isRunning) return;
  
  console.log('[JobProcessor] Starting job processor');
  isRunning = true;
  
  processPendingJobs();
}

/**
 * Stop the job processor
 */
export function stopJobProcessor(): void {
  console.log('[JobProcessor] Stopping job processor');
  isRunning = false;
}

/**
 * Get statistics about active jobs
 */
export function getJobStats(): Record<string, any> {
  const stats = {
    isRunning,
    activeJobs: {},
  };
  
  for (const jobType of Object.keys(activeJobs) as JobType[]) {
    stats.activeJobs[jobType] = {
      active: activeJobs[jobType].size,
      capacity: maxConcurrentJobs[jobType],
    };
  }
  
  return stats;
}
