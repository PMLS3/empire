import { defineEventHandler, readBody, createError } from 'h3';
import { getUserSession, type UserSession } from '../../utils/session'
import { useFirebaseServer } from '../../firebase/init'
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { createEmbeddings } from '../../utils/session';

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = await getUserSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    const body = await readBody(event);
    const { collection: collectionName, id, data, embed = [] } = body;

    // Validate collection name, id, and data
    if (!collectionName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Collection name is required',
      });
    }

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Document ID is required',
      });
    }

    if (!data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Data is required',
      });
    }
    const { firestore } = useFirebaseServer(session.user?.token?.idToken as string)

    // Get document reference
    const docRef = doc(firestore, collectionName, id);
    
    // Check if document exists
    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Document not found',
      });
    }

    // Check ownership if user_id is present in the document
    const docData = docSnapshot.data();
    if (docData.user_id && session.user?.id && docData.user_id !== session.user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to update this document',
      });
    }

    // Generate embeddings for specified fields
    let dataWithEmbeddings = { ...data };
    
    // Generate embeddings if fields are specified using the imported createEmbeddings
    if (embed && Array.isArray(embed) && embed.length > 0) {
      const embeddings = await createEmbeddings(data, embed);
      
      if (embeddings) {
        dataWithEmbeddings.embedding = embeddings;
      }
    }

    // Add updated timestamp
    dataWithEmbeddings.updated_at = new Date().toISOString();
    
    // Update the document
    await updateDoc(docRef, dataWithEmbeddings);

    // Return updated data with ID
    let updatedData = {
      id,
      ...docData,
      ...dataWithEmbeddings,
    };
    return {
      statusCode: 200,
      data: updatedData,
    }
  } catch (error: any) {
    console.error('Data update error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error updating data',
    });
  }
});