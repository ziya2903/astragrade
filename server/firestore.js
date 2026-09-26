/**
 * AstraGrade Firebase Firestore Module
 *
 * This module allows saving and retrieving reports from Firebase Firestore.
 * If Firebase configuration is not provided in environment variables,
 * the application falls back gracefully to the local JSON persistence layer.
 */

let db = null;
let isFirebaseEnabled = false;

try {
  // Check if Firebase service account or config is present
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const admin = require('firebase-admin');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });

    db = admin.firestore();
    isFirebaseEnabled = true;
    console.log('[AstraGrade] Connected to Firebase Firestore successfully.');
  } else {
    console.log('[AstraGrade] Firebase credentials not detected; using persistent local storage mode.');
  }
} catch (error) {
  console.warn('[AstraGrade] Firebase initialization warning:', error.message);
}

module.exports = {
  isFirebaseEnabled: () => isFirebaseEnabled,
  getDb: () => db
};
