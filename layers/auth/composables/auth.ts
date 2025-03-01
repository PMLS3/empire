import type { Profile, Workspace, WorkspaceRole } from '~/types/auth'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser
} from "firebase/auth"
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  type Timestamp
} from "firebase/firestore"
import { useFirebase } from "./firebase"
import { useToaster } from "../../shared/composables/toaster"

interface PublicUser {
  id: string
  email: string
  username: string
  token: any
}

interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at: Timestamp | null
}

interface AuthState {
  user: PublicUser | null
  currentWorkspace: WorkspaceWithRole | null
  currentProfile: Profile | null
  workspaces: WorkspaceWithRole[]
  isAuthenticated: boolean
}

export const useAuth = () => {
  const { auth, firestore } = useFirebase()
  const { showError, showSuccess } = useToaster()

  // Create cookies for persistent state
  const userCookie = useCookie<PublicUser | null>('auth:user')
  const workspacesCookie = useCookie<WorkspaceWithRole[]>('auth:workspaces', {
    default: () => []
  })
  const currentWorkspaceCookie = useCookie<WorkspaceWithRole | null>('auth:currentWorkspace')
  const currentProfileCookie = useCookie<Profile | null>('auth:currentProfile')

  // Create reactive state with initial values from cookies
  const state = useState<AuthState>('auth', () => ({
    user: userCookie.value || null,
    currentWorkspace: currentWorkspaceCookie.value || null,
    currentProfile: currentProfileCookie.value || null,
    workspaces: workspacesCookie.value || [],
    isAuthenticated: !!userCookie.value,
  }))

  // Setters that update both state and cookies
  const setUser = (user: PublicUser | null) => {
    state.value.user = user
    state.value.isAuthenticated = !!user
    userCookie.value = user
  }

  const setWorkspaces = (workspaces: WorkspaceWithRole[]) => {
    state.value.workspaces = workspaces
    workspacesCookie.value = workspaces
  }

  const setCurrentWorkspace = async (workspaceId: string) => {
    const workspace = state.value.workspaces.find(w => w.id === workspaceId)
    if (!workspace) return

    try {
      // Get the profile for this workspace from Firestore
      const profileRef = doc(firestore, 'profiles', `${state.value.user?.id}_${workspaceId}`)
      const profileSnap = await getDoc(profileRef)
      
      if (profileSnap.exists()) {
        const profile = profileSnap.data() as Profile
        
        // Update state and cookies
        state.value.currentProfile = profile
        state.value.currentWorkspace = workspace
        
        currentProfileCookie.value = profile
        currentWorkspaceCookie.value = workspace
      } else {
        throw new Error('Profile not found')
      }
    } catch (error) {
      console.error('Failed to fetch workspace profile:', error)
      throw error
    }
  }

  // Firebase Auth Actions
  const login = async (email: string, password: string) => {
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get user data from Firestore
      const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid))
      if (!userDoc.exists()) {
        throw new Error('User data not found')
      }
      console.log('userCredential', userCredential)
      const userData = userDoc.data()
      const publicUser: PublicUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        username: userData.username,
        token: userCredential._tokenResponse,
      }

      // Get user's workspaces
      const workspaceMembersRef = collection(firestore, 'workspace_members')
      const q = query(workspaceMembersRef, where('user_id', '==', firebaseUser.uid))
      const membershipDocs = await getDocs(q)

      const workspaces: WorkspaceWithRole[] = []
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

      // Update state
      setUser(publicUser)
      setWorkspaces(workspaces)
      
      // Set current workspace to the first one
      if (workspaces.length > 0) {
        await setCurrentWorkspace(workspaces[0].id)
      }
      await setSessionServer()

      return { user: publicUser, workspaces, currentWorkspaceId: workspaces[0]?.id }
    } catch (error: any) {
      console.error('Login error:', error)
      showError(error.message)
      throw error
    }
  }

  const signup = async (formData: {
    email: string
    username: string
    password: string
    confirmPassword: string
  }) => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const firebaseUser = userCredential.user

      // Create user document in Firestore
      const userRef = doc(firestore, 'users', firebaseUser.uid)
      await setDoc(userRef, {
        email: formData.email,
        username: formData.username,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        is_active: true,
        deleted_at: null
      })

      // Create default workspace
      const workspaceRef = doc(collection(firestore, 'workspaces'))
      const workspaceData = {
        name: `${formData.username}'s Workspace`,
        slug: formData.username.toLowerCase(),
        description: null,
        logo_url: null,
        created_by: firebaseUser.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        deleted_at: null
      }
      await setDoc(workspaceRef, workspaceData)

      // Create workspace membership
      const memberRef = doc(firestore, 'workspace_members', `${workspaceRef.id}_${firebaseUser.uid}`)
      await setDoc(memberRef, {
        workspace_id: workspaceRef.id,
        user_id: firebaseUser.uid,
        role: 'owner',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })

      // Create profile
      const profileRef = doc(firestore, 'profiles', `${firebaseUser.uid}_${workspaceRef.id}`)
      await setDoc(profileRef, {
        user_id: firebaseUser.uid,
        workspace_id: workspaceRef.id,
        display_name: formData.username,
        bio: null,
        avatar_url: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        deleted_at: null
      })

      // Update user state
      const publicUser: PublicUser = {
        id: firebaseUser.uid,
        email: formData.email,
        username: formData.username,
        token: userCredential._tokenResponse,
      }

      const workspace: WorkspaceWithRole = {
        id: workspaceRef.id,
        ...workspaceData,
        role: 'owner'
      } as WorkspaceWithRole

      setUser(publicUser)
      setWorkspaces([workspace])
      await setCurrentWorkspace(workspace.id)
      await setSessionServer()

      showSuccess('Account created successfully!')
      return { user: publicUser, workspaceId: workspaceRef.id }
    } catch (error: any) {
      console.error('Signup error:', error)
      showError(error.message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      
      // Clear state and cookies
      state.value = {
        user: null,
        currentWorkspace: null,
        currentProfile: null,
        workspaces: [],
        isAuthenticated: false,
      }
      
      userCookie.value = null
      workspacesCookie.value = []
      currentWorkspaceCookie.value = null
      currentProfileCookie.value = null
      await setSessionServer()

      showSuccess('Logged out successfully')
    } catch (error: any) {
      console.error('Logout error:', error)
      showError(error.message)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      showSuccess('Password reset email sent')
    } catch (error: any) {
      console.error('Password reset error:', error)
      showError(error.message)
      throw error
    }
  }

  const switchWorkspace = async (workspaceId: string) => {
    try {
      await setCurrentWorkspace(workspaceId)
      await setSessionServer()
      showSuccess('Workspace switched successfully')
    } catch (error: any) {
      console.error('Switch workspace error:', error)
      showError(error.message)
      throw error
    }
  }

  async function setSessionServer() {

    try {
      const stateResponse = await $fetch('/api/auth/set',{
        method: 'POST',
        body: state.value
      })
      state.value = stateResponse as AuthState
    } catch (error) {
      console.error('Failed to set session:', error)
      showError('Failed to set session')
    }
  }

  // Getters
  const getCurrentWorkspaceId = computed(() => state.value.currentWorkspace?.id)
  const getCurrentProfileId = computed(() => state.value.currentProfile?.id)
  const getCurrentWorkspaceRole = computed(() => state.value.currentWorkspace?.role)
  const isWorkspaceOwner = computed(() => state.value.currentWorkspace?.role === 'owner')
  const isWorkspaceAdmin = computed(() => 
    ['owner', 'admin'].includes(state.value.currentWorkspace?.role || '')
  )

  return {
    // State
    user: computed(() => state.value.user),
    currentWorkspace: computed(() => state.value.currentWorkspace),
    currentProfile: computed(() => state.value.currentProfile),
    workspaces: computed(() => state.value.workspaces),
    isAuthenticated: computed(() => state.value.isAuthenticated),

    // Getters
    getCurrentWorkspaceId,
    getCurrentProfileId,
    getCurrentWorkspaceRole,
    isWorkspaceOwner,
    isWorkspaceAdmin,

    // Actions
    login,
    signup,
    logout,
    resetPassword,
    switchWorkspace,
    setCurrentWorkspace,
  }
} 