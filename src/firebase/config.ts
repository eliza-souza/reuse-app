import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDYGU13_z3fIyD73wo6imAIgKseN19gVd4",
  authDomain: "reuse-app-aff90.firebaseapp.com",
  projectId: "reuse-app-aff90",
  storageBucket: "reuse-app-aff90.appspot.com",
  messagingSenderId: "569785583931",
  appId: "1:569785583931:web:55274669979766cac7cf1e",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)