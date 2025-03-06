import { v4 as uuidv4 } from 'uuid';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

// Job types
export type JobType = 'text-generation' | 'speech-synthesis' | 'image-generation' | 'video-rendering';

// Job status
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Job interface
export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  data: any; // Job-specific data
  result?: any; // Job result
  error?: string; // Error message if failed
  progress?: number; // Progress percentage (0-100)
  created_at: string;
  started_at?: string;
  completed_at?: string;
  owner_id: string;
  workspace_id: string;
  priority: number; // 1 (highest) to 5 (lowest)
}

/**
 * Creates a new job in the queue
 */
export async function createJob(
  type: JobType,
  data: any,
  ownerId: string,
  workspaceId: string,
  priority: number = 3
): Promise<string> {
  try {
    const jobId = uuidv4();
    const jobRef = doc(db, 'jobs', jobId);
    
    const job: Job = {
      id: jobId,
      type,
      status: 'pending',
      data,
      created_at: new Date().toISOString(),
      owner_id: ownerId,
      workspace_id: workspaceId,
      priority
    };
    
    await setDoc(jobRef, job);
    console.log(`[JobQueue] Created job ${jobId} of type ${type}`);
    
    return jobId;
  } catch (error) {
    console.error('[JobQueue] Error creating job:', error);
    throw error;
  }
}

/**
 * Get a job by ID
 */
export async function getJob(jobId: string): Promise<Job | null> {
  try {
    const jobRef = doc(db, 'jobs', jobId);
    const jobSnapshot = await getDoc(jobRef);
    
    if (!jobSnapshot.exists()) {
      return null;
    }
    
    return jobSnapshot.data() as Job;
  } catch (error) {
    console.error(`[JobQueue] Error getting job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Update a job's status and data
 */
export async function updateJob(
  jobId: string, 
  updateData: Partial<Job>
): Promise<void> {
  try {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, updateData);
    console.log(`[JobQueue] Updated job ${jobId}`);
  } catch (error) {
    console.error(`[JobQueue] Error updating job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Set job as processing
 */
export async function startProcessingJob(jobId: string): Promise<void> {
  const now = new Date().toISOString();
  await updateJob(jobId, {
    status: 'processing',
    started_at: now
  });
}

/**
 * Set job as completed with results
 */
export async function completeJob(jobId: string, result: any): Promise<void> {
  const now = new Date().toISOString();
  await updateJob(jobId, {
    status: 'completed',
    result,
    completed_at: now,
    progress: 100
  });
}

/**
 * Set job as failed with error
 */
export async function failJob(jobId: string, error: string): Promise<void> {
  const now = new Date().toISOString();
  await updateJob(jobId, {
    status: 'failed',
    error,
    completed_at: now
  });
}

/**
 * Update job progress
 */
export async function updateJobProgress(jobId: string, progress: number): Promise<void> {
  await updateJob(jobId, { progress });
}

/**
 * Get next pending job of specific type
 */
export async function getNextPendingJob(type: JobType): Promise<Job | null> {
  try {
    const jobsRef = collection(db, 'jobs');
    const q = query(
      jobsRef,
      where('type', '==', type),
      where('status', '==', 'pending'),
      orderBy('priority'),
      orderBy('created_at'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return querySnapshot.docs[0].data() as Job;
  } catch (error) {
    console.error(`[JobQueue] Error getting next pending job of type ${type}:`, error);
    throw error;
  }
}
