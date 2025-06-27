import { initializeApp, getApp, getApps, FirebaseOptions } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
// This pattern is to prevent re-initializing the app on hot reloads.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get the AI instance, explicitly using the Google AI backend.
// This is necessary to use a standard Google AI API key instead of a Vertex AI setup.
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance
// The Google AI backend is used by default and does not need to be specified.
const generativeModel = getGenerativeModel(ai, { model: "gemini-1.5-flash-latest" });

// Initialize Firestore
const db = getFirestore(app);

export { generativeModel, db };
