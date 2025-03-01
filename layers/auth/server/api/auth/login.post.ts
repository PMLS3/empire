import { defineEventHandler } from 'h3'
import { z } from 'zod'
import { setUserSession } from '~/server/utils/session'
import { useFirebase } from '~/composables/firebase'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export default defineEventHandler(async (event) => {
  try {
    console.log('📝 Login request received')
    const body = await readBody(event)
    console.log('📝 Request body:', body)

    console.log('📝 Validating input')
    const input = loginSchema.parse(body)
    console.log('📝 Input validation successful')

    const { auth, firestore } = useFirebase()

    // Sign in with Firebase Auth
    console.log('📝 Authenticating user')
    const userCredential = await signInWithEmailAndPassword(auth, input.email, input.password)
    const firebaseUser = userCredential.user
    console.log('📝 User authenticated:', { userId: firebaseUser.uid })

    try {
      // Get user data from Firestore with retry
      const maxRetries = 3
      let retryCount = 0
      let userDoc = null

      while (retryCount < maxRetries) {
        try {
          userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid))
          if (userDoc.exists()) break
          retryCount++
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Exponential backoff
        } catch (error) {
          console.error(`Retry ${retryCount + 1} failed:`, error)
          retryCount++
          if (retryCount === maxRetries) throw error
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        }
      }

      if (!userDoc || !userDoc.exists()) {
        throw createError({
          statusCode: 404,
          message: 'User data not found'
        })
      }
      console.log('userCredential', userCredential)
      const userData = userDoc.data()
      const user = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        username: userData.username,
        token: userCredential.user.getIdToken()
      }

      // Get user's workspaces with retry
      console.log('📝 Fetching user workspaces')
      const workspaceMembersRef = collection(firestore, 'workspace_members')
      const q = query(workspaceMembersRef, where('user_id', '==', firebaseUser.uid))
      const membershipDocs = await getDocs(q)

      const workspaces = []
      for (const memberDoc of membershipDocs.docs) {
        const memberData = memberDoc.data()
        const workspaceDoc = await getDoc(doc(firestore, 'workspaces', memberData.workspace_id))
        
        if (workspaceDoc.exists()) {
          const workspaceData = workspaceDoc.data()
          workspaces.push({
            id: workspaceDoc.id,
            name: workspaceData.name,
            slug: workspaceData.slug,
            description: workspaceData.description,
            logo_url: workspaceData.logo_url,
            created_by: workspaceData.created_by,
            role: memberData.role,
            created_at: workspaceData.created_at,
            updated_at: workspaceData.updated_at,
            deleted_at: workspaceData.deleted_at
          })
        }
      }
      console.log('📝 Fetched workspaces:', workspaces)

      // Set session with first workspace as current
      if (workspaces.length > 0) {
        await setUserSession(event, {
          id: user.id,
          email: user.email,
          username: user.username,
          currentWorkspaceId: workspaces[0].id,
          token: user.token
        })
      }

      return {
        user,
        workspaces,
        currentWorkspaceId: workspaces[0]?.id,
        token: user.token
      }
    } catch (firestoreError) {
      console.error('❌ Firestore error:', firestoreError)
      throw createError({
        statusCode: 503,
        message: 'Unable to access user data. Please check your internet connection and try again.'
      })
    }
  } catch (error: any) {
    console.error('❌ Login error:', error)

    if (error instanceof FirebaseError) {
      if (error.code === 'auth/invalid-credential') {
        throw createError({
          statusCode: 401,
          message: 'Invalid email or password'
        })
      }
      
      if (error.code === 'auth/network-request-failed') {
        throw createError({
          statusCode: 503,
          message: 'Network error. Please check your internet connection and try again.'
        })
      }
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: error instanceof Error ? error.message : 'Login failed'
    })
  }
}) 