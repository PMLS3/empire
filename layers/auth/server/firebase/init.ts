import { initializeServerApp, type FirebaseApp } from "firebase/app"
import { getVertexAI, getGenerativeModel } from "firebase/vertexai"
import {
  browserSessionPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
  onAuthStateChanged,
  type Auth
} from "firebase/auth"
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore"

let firebaseApp: FirebaseApp | null = null
let firestoreInstance: Firestore | null = null
let authInstance: Auth | null = null
let isEmulatorConnected = false

export const useFirebaseServer = (authIdToken: string | undefined) => {
  const config = useRuntimeConfig()
  const isDevelopment = process.env.NODE_ENV === "development"
  const firebaseConfig: any = config.firebaseConfig

  try {
    // Initialize Firebase app only if not already initialized
    if (!firebaseApp) {
      console.log('[Firebase] Initializing Firebase app')
      firebaseApp = initializeServerApp(firebaseConfig, {
        authIdToken: authIdToken ?? undefined,
      })
    }

    // Get or create Auth instance
    if (!authInstance) {
      console.log('[Firebase] Initializing Auth')
      authInstance = getAuth(firebaseApp)
    }

    // Get or create Firestore instance
    if (!firestoreInstance) {
      console.log('[Firebase] Initializing Firestore')
      firestoreInstance = getFirestore(firebaseApp)
    }

    // Connect to emulators only once in development
    if (isDevelopment && !isEmulatorConnected) {
      try {
        console.log('[Firebase] Connecting to emulators')
        connectFirestoreEmulator(firestoreInstance, "localhost", 8080)
        
        const authUrl = "http://127.0.0.1:9099"
        connectAuthEmulator(authInstance, authUrl, { disableWarnings: true })

        setPersistence(authInstance, browserSessionPersistence).catch((err) => {
          console.error("[Firebase] Error enabling persistence:", err)
        })

        isEmulatorConnected = true
        console.log('[Firebase] Successfully connected to emulators')
      } catch (error) {
        console.error("[Firebase] Error setting up emulators:", error)
        // Continue without emulators in case of error
      }
    }

    // Initialize VertexAI for each request as it might need the current auth token
    const vertexAI = getVertexAI(firebaseApp)
    const model = getGenerativeModel(vertexAI, {
      model: "gemini-1.5-flash-preview-0514",
    })

    return {
      firebaseApp,
      firestore: firestoreInstance,
      auth: authInstance,
      vertexAI,
      model,
      storage: null,
      onAuthStateChanged,
      messaging: null,
    }
  } catch (error) {
    console.error("[Firebase] Error in useFirebaseServer:", error)
    throw error
  }
}