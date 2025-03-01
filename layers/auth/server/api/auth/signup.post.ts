import { ZodError } from 'zod'
import { signupSchema } from '~/server/types/auth'
import { setUserSession } from '~/server/utils/session'
import { useFirebase } from '~/composables/firebase'
import { doc, setDoc, collection, query, where, getDocs, getDoc, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { v4 as uuidv4 } from 'uuid'
import slugify from 'slugify'

export default defineEventHandler(async (event) => {
  try {
    console.log('📝 Signup request received')
    const body = await readBody(event)
    console.log('📝 Request body:', body)
    
    // Validate input
    console.log('📝 Validating input with Zod')
    const input = signupSchema.parse(body)
    console.log('📝 Input validation successful')
    
    const { auth, firestore } = useFirebase()

    // Create user with Firebase Auth
    console.log('📝 Creating Firebase user')
    const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password)
    const firebaseUser = userCredential.user
    console.log('📝 Firebase user created:', { userId: firebaseUser.uid })

    // Create user document
    const userRef = doc(firestore, 'users', firebaseUser.uid)
    await setDoc(userRef, {
      email: input.email,
      username: input.username,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      is_active: true,
      deleted_at: null
    })

    // Create default workspace
    const workspaceId = uuidv4()
    const workspaceRef = doc(firestore, 'workspaces', workspaceId)
    await setDoc(workspaceRef, {
      name: `${input.username}'s Workspace`,
      slug: slugify(input.username, { lower: true }),
      description: null,
      logo_url: null,
      created_by: firebaseUser.uid,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      deleted_at: null
    })

    // Create workspace membership
    const memberRef = doc(firestore, 'workspace_members', `${workspaceId}_${firebaseUser.uid}`)
    await setDoc(memberRef, {
      workspace_id: workspaceId,
      user_id: firebaseUser.uid,
      role: 'owner',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    })

    // Create profile
    const profileRef = doc(firestore, 'profiles', `${firebaseUser.uid}_${workspaceId}`)
    await setDoc(profileRef, {
      user_id: firebaseUser.uid,
      workspace_id: workspaceId,
      display_name: input.username,
      bio: null,
      avatar_url: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      deleted_at: null
    })

    // Set session
    console.log('📝 Setting user session')
    await setUserSession(event, { 
      id: firebaseUser.uid,
      email: input.email,
      username: input.username,
      currentWorkspaceId: workspaceId
    })

    // Get current profile and workspace data
    const profileDoc = await getDoc(profileRef)
    const workspaceDoc = await getDoc(workspaceRef)

    return {
      user: {
        id: firebaseUser.uid,
        email: input.email,
        username: input.username
      },
      workspaces: [{
        id: workspaceId,
        ...workspaceDoc.data(),
        role: 'owner'
      }],
      currentWorkspace: {
        id: workspaceId,
        ...workspaceDoc.data(),
        role: 'owner'
      },
      currentProfile: profileDoc.data()
    }
  } catch (error: any) {
    console.error('❌ Error in signup:', error)
    
    if (error instanceof ZodError) {
      console.error('❌ Zod validation error:', error.errors)
      throw createError({
        statusCode: 400,
        message: error.errors[0].message
      })
    }

    // Handle Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      throw createError({
        statusCode: 400,
        message: 'This email is already taken. Please choose another one.'
      })
    }
    
    throw createError({
      statusCode: 500,
      message: 'An error occurred during signup. Please try again.'
    })
  }
}) 