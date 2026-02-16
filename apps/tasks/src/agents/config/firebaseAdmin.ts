import { config as dotenvConfig } from 'dotenv'
// Load .env before anything else — ES module imports are hoisted,
// so entry-point dotenv calls run too late for this module.
dotenvConfig()

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

function initialize() {
  if (getApps().length > 0) {
    return getApp()
  }

  const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  }

  if (!config.projectId) {
    throw new Error('Firebase configuration missing. Ensure VITE_FIREBASE_* vars are set in .env.')
  }

  console.log(`[Firebase] Initializing with project: ${config.projectId}`)
  return initializeApp(config)
}

const app = initialize()
export const adminDb = getFirestore(app)
