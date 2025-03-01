import { summarize_audio, transcript_audio } from "../../../../ai/server/utils/tools/vertex/audio";
import { analyze_pdf } from "../../../../ai/server/utils/tools/vertex/documents";
import { sendMultiModalPromptWithImage } from "../../../../ai/server/utils/tools/vertex/image";
import { sendMultiModalPromptWithVideo, analyze_video_with_audio,  } from "../../../../ai/server/utils/tools/vertex/video";
import { chunkFile, chunkText, videoToAudio } from "../../../../ai/server/utils/tools/files";
import { defineEventHandler, readMultipartFormData } from 'h3'
import { useRuntimeConfig } from '#imports'
import { join } from 'path'
import { promises as fs } from 'fs'
import { getUserSession, type UserSession } from '../../../../auth/server/utils/session'
import { useFirebaseServer } from '../../../../auth/server/firebase/init'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

type File = {
  src: string;
  type: string;
}

export default defineEventHandler(async (event: any) => {
  try {
    console.log('[understanding] Starting handler');
    const session: UserSession | null = await getUserSession(event)
    if (!session) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const config = useRuntimeConfig()
    const formData = await readMultipartFormData(event)

    if (!formData) {
      console.error('[understanding] No form data received');
      throw new Error('No form data received')
    }

    const file = formData.find(part => part.name === 'file')
    if (!file) {
      console.error('[understanding] No file found in form data');
      throw new Error('No file found in form data')
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), '.app', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const filename = `${Date.now()}-${file.filename}`
    const filepath = join(uploadsDir, filename)

    // Write file to disk
    await fs.writeFile(filepath, file.data)
    console.log('[understanding] File written to:', filepath);

    let projectId = formData.find(part => part.name === 'projectId')?.data.toString();
    let location = formData.find(part => part.name === 'location')?.data.toString();
    let model = formData.find(part => part.name === 'model')?.data.toString();
    let question = formData.find(part => part.name === 'question')?.data.toString();

    let understandings: any = {};
    const firebaseConfig: any = config.firebaseConfig

    if (!projectId) {
      projectId = firebaseConfig.projectId;
    }
    if (!location) {
      location = 'us-central1';
    }
    if (!model) {
      model = 'gemini-1.5-flash-001';
    }
    if (!question) {
      question = 'what is shown in this image?';
    }

    try {
      console.log('[understanding] Processing file:', {
        type: file.type,
        filename,
        projectId,
        location,
        model,
        question
      });

      if (file.type === 'application/pdf') {
        const understanding = await analyze_pdf(projectId, location, model, filepath);
        const chunks = await chunkFile(filepath, 1024 * 1024 * 5);
        understandings = { file: { src: filepath, type: file.type }, understanding, chunks };
      } else if (file.type === 'video/mp4') {
        const audioUrl = await videoToAudio(filepath);
        const understanding = await analyze_video_with_audio(projectId, location, model, filepath);
        const transcript: any = await transcript_audio(projectId, location, model, audioUrl);
        const chunks = await chunkText(transcript, 1024 * 1024 * 5);
        understandings = { file: { src: filepath, type: file.type }, understanding, chunks, transcript };
      } else if (file.type === 'audio/mp3') {
        const understanding: any = await transcript_audio(projectId, location, model, filepath);
        const chunks = await chunkText(understanding, 1024 * 1024 * 5);
        understandings = { file: { src: filepath, type: file.type }, understanding, chunks };
      } else if (file.type?.startsWith('image/')) {
        console.log('[understanding] Analyzing image with Vertex AI');
        const understanding = await sendMultiModalPromptWithImage(
          projectId,
          location,
          model,
          [filepath],
          question
        );
        console.log('[understanding] Got image analysis:', understanding);
        understandings = {
          file: { src: filepath, type: file.type },
          understanding: understanding.fullTextResponse,
          usageMetadata: understanding.usageMetadata
        };
      }

      // Store understanding results in Firestore
      const { firestore } = useFirebaseServer(session?.user?.token?.idToken as string)
      const understandingDoc = await addDoc(collection(firestore, 'understandings'), {
        workspace_id: session.currentWorkspace?.id,
        file_name: filename,
        file_path: filepath,
        file_type: file.type,
        project_id: projectId,
        location,
        model,
        question,
        understandings,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })

      console.log('[understanding] Successfully processed file and stored results');
      return {
        success: true,
        id: understandingDoc.id,
        filename,
        filepath,
        understandings
      }
    } catch (error) {
      console.error('[understanding] Error processing file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  } catch (error: any) {
    console.error('[understanding] Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
