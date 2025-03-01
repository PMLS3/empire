import { defineEventHandler, readBody } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { getUserSession, type UserSession } from '../../../../auth/server/utils/session'
import { useFirebaseServer } from '../../../../auth/server/firebase/init'
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore'
import { EmbeddingsHandler } from '../../../../ai/server/utils/embeddings'

export default defineEventHandler(async (event) => {
  try {
    console.log('[Upload] Starting file upload process')
    
    // Get user session
    console.log('[Upload] Attempting to get user session')
    const session: UserSession | null = await getUserSession(event)
    console.log('[Upload] Session retrieved:', {
      hasSession: !!session,
      userId: session?.user?.id,
      workspaceId: session?.currentWorkspace?.id
    })
    
    if (!session) {
      console.error('[Upload] No session found')
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // Get request body
    const body = await readBody(event)
    console.log('[Upload] Request body received:', {
      name: body.name,
      type: body.type,
      size: body.size,
      hasUnderstanding: !!body.understanding
    })

    // Create embeddings for understanding
    const embeddingsHandler = new EmbeddingsHandler()
    let chunks: { chunk: string; embedding: number[] }[] = []

    if (body.understanding?.summary) {
      console.log('[Upload] Creating embeddings for understanding')
      
      try {
        // Create embedding for summary
        const summaryEmbedding = await embeddingsHandler.getEmbeddings([body.understanding.summary])
        console.log('[Upload] Summary embedding created:', {
          inputLength: body.understanding.summary.length,
          embeddingLength: summaryEmbedding[0]?.embedding?.length
        })

        if (summaryEmbedding[0]?.embedding?.length) {
          chunks.push({
            chunk: body.understanding.summary,
            embedding: summaryEmbedding[0].embedding
          })
        }

        // Create embeddings for chunks if they exist
        if (body.understanding.chunks?.length) {
          console.log('[Upload] Creating embeddings for chunks:', body.understanding.chunks.length)
          const chunkEmbeddings = await embeddingsHandler.getEmbeddings(body.understanding.chunks)
          
          for (let i = 0; i < chunkEmbeddings.length; i++) {
            if (chunkEmbeddings[i]?.embedding?.length) {
              chunks.push({
                chunk: body.understanding.chunks[i],
                embedding: chunkEmbeddings[i].embedding
              })
            }
          }
          
          console.log('[Upload] Chunk embeddings created:', {
            requested: body.understanding.chunks.length,
            created: chunks.length - 1 // minus summary
          })
        }
      } catch (error) {
        console.error('[Upload] Error creating embeddings:', error)
        // Continue without embeddings if they fail
      }
    }

    const { firestore } = useFirebaseServer(session?.user?.token?.idToken as string)

    // Create upload document
    const uploadId = uuidv4()
    const uploadRef = doc(firestore, 'uploads', uploadId)
    const uploadData = {
      name: body.name,
      type: body.type,
      size: body.size,
      url: body.url,
      owner_id: session.user?.id,
      workspace_id: session.currentWorkspace?.id,
      folder_id: body.folder_id || null,
      shared: false,
      understanding: body.understanding || null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      deleted_at: null
    }

    await setDoc(uploadRef, uploadData)

    // Store chunks with embeddings
    if (chunks.length) {
      console.log('[Upload] Storing chunks with embeddings:', {
        count: chunks.length,
        sampleDimensions: chunks[0]?.embedding?.length
      })

      // Validate embeddings before insert
      const validChunks = chunks.filter(chunk => 
        Array.isArray(chunk.embedding) && 
        chunk.embedding.length === 768 && // VertexAI gecko model embedding size
        chunk.embedding.every(n => typeof n === 'number')
      )

      if (validChunks.length) {
        const chunksCollection = collection(firestore, 'upload_chunks')
        const chunkPromises = validChunks.map(chunk => {
          const chunkId = uuidv4()
          const chunkRef = doc(chunksCollection, chunkId)
          return setDoc(chunkRef, {
            id: chunkId,
            upload_id: uploadId,
            chunk: chunk.chunk,
            embedding: chunk.embedding,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            deleted_at: null
          })
        })

        await Promise.all(chunkPromises)
        console.log('[Upload] Successfully stored chunks:', validChunks.length)
      } else {
        console.warn('[Upload] No valid embeddings to store:', {
          totalChunks: chunks.length,
          sampleDimensions: chunks[0]?.embedding?.length,
          expectedDimensions: 768,
          sampleValid: chunks[0]?.embedding?.every(n => typeof n === 'number')
        })
      }
    }

    console.log('[Upload] Database record created:', {
      id: uploadId,
      name: uploadData.name,
      chunksStored: chunks.length
    })

    return { 
      files: [{
        id: uploadId,
        ...uploadData
      }]
    }
  } catch (error: any) {
    console.error('[Upload] Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    })
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to upload files'
    })
  }
}) 