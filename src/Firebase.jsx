// Firebase.jsx
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDi5IcNf-A3EECr32iok3x3uSs7cAMYcjA",
  authDomain: "task-tracker-cc39e.firebaseapp.com",
  projectId: "task-tracker-cc39e",
  storageBucket: "task-tracker-cc39e.appspot.com",
  messagingSenderId: "611634446515",
  appId: "1:611634446515:web:5af1f6481474b0374730c6",
  measurementId: "G-FHDGNZ94PP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get auth instance
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app); // Initialize Firestore

// Export necessary functions and objects
export { auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, db }; // Export db