import { initializeApp, getApp, type FirebaseApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

function createFirebaseApp(): FirebaseApp {
  try {
    return getApp()
  } catch {
    return initializeApp(firebaseConfig)
  }
}

const app = createFirebaseApp()
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app 