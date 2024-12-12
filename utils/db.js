//utils/db.js
const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
} = require("firebase/auth");

const serviceAccount = require("./firebase-admin-config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Konfigurasi Firebase client-side
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  // ... konfigurasi lainnya dari Firebase Console
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

const auth = admin.auth();
const db = admin.firestore();

module.exports = {
  auth,
  db,
  firebaseAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
};
