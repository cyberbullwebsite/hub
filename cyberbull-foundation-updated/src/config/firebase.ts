import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCXU4cKHOEYhZIWtyWyMgAlpLmsx5O4Bjc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'main-df88c.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'main-df88c',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'main-df88c.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '265175063386',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:265175063386:web:b5071a5424fb09ef0ab163',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

export async function configureAuthPersistence() {
  await setPersistence(auth, browserLocalPersistence)
}
