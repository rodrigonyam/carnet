import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyBxjAmE1ZjFw4EM2hv--oaYfd_lwbZ5v9g',
  authDomain: 'carnets-cbb8b.firebaseapp.com',
  projectId: 'carnets-cbb8b',
  storageBucket: 'carnets-cbb8b.firebasestorage.app',
  messagingSenderId: '1091141529740',
  appId: '1:1091141529740:web:cb8ff55ec31bcd3e288ba9',
  measurementId: 'G-W2GK60WCJQ',
}

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultFirebaseConfig.measurementId,
}

const app = initializeApp(firebaseConfig)
let analytics = null

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  }).catch(() => {
    analytics = null
  })
}

export const db      = getFirestore(app)
export { analytics }
