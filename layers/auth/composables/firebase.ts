import { initializeApp } from "firebase/app"
import { getVertexAI, getGenerativeModel } from "firebase/vertexai"
import {
  browserSessionPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
  onAuthStateChanged,
} from "firebase/auth"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
import { connectStorageEmulator, getStorage } from "firebase/storage"
import { getMessaging } from "firebase/messaging"



export const useFirebase =  () => {
  const config = useRuntimeConfig()
  const configApp: any = useAppConfig()
  const test: any = process.env.NODE_ENV === "development"
  const firebaseConfig: any = config.public.firebaseConfig

  console.log('firebaseConfig', firebaseConfig)

  const firebaseApp = initializeApp(firebaseConfig)
  const auth = getAuth(firebaseApp)
  const firestore = getFirestore(firebaseApp)
  let storage = null
  let messaging = null

  const vertexAI = getVertexAI(firebaseApp)
  const model = getGenerativeModel(vertexAI, {
    model: "gemini-1.5-flash-preview-0514",
  })
  if (process.client) {
    messaging = getMessaging(firebaseApp)
    storage = getStorage(firebaseApp)

    if(test){
    connectStorageEmulator(storage, "localhost", 9199)

    }
  }


  const host =
    (firestore.toJSON() as { settings?: { host?: string } }).settings?.host ??
    ""
  if (test) {
    if (!host.startsWith("localhost")) {
      connectFirestoreEmulator(firestore, "localhost", 8080)
    }

    const authUrl = host.startsWith("localhost")
      ? "http://localhost:9099"
      : "http://127.0.0.1:9099"
    try {
      connectAuthEmulator(auth, authUrl, { disableWarnings: true })
    } catch (error) {
      console.error("Error connecting to Auth Emulator:", error)
    }

  }

  setPersistence(auth, browserSessionPersistence).catch((err) => {
    console.error("Error enabling persistence: ", err)
  })



  return {
    firebaseApp,
    firestore,
    auth,
    vertexAI,
    model,
    storage,
    onAuthStateChanged,
    messaging,
  }
}