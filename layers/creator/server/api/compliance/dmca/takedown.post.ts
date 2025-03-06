import { defineEventHandler, readBody, createError } from 'h3';
import { getServerSession } from '#auth';
import { db } from '../../../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

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
      contentId,
      contentType,
      originalWorkDescription,
      copyrightProof,
      requestedAction,
      claimantName,
      claimantEmail,
      declaration,
    } = body;
    
    // Validate required fields
    if (!contentId || !contentType || !originalWorkDescription || !copyrightProof || !declaration) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      });
    }
    
    // Create DMCA case
    const caseId = uuidv4();
    const caseRef = doc(db, 'dmca_cases', caseId);
    
    await setDoc(caseRef, {
      id: caseId,
      content_id: contentId,
      content_type: contentType,
      original_work_description: originalWorkDescription,
      copyright_proof: copyrightProof,
      requested_action: requestedAction || 'remove',
      claimant_name: claimantName || session.user?.username || 'Anonymous',
      claimant_email: claimantEmail || session.user?.email,
      claimant_user_id: session.user?.id,
      declaration: declaration,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    return { success: true, caseId };
  } catch (error) {
    console.error('DMCA takedown error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error submitting DMCA takedown',
    });
  }
});
