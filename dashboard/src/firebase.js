import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDwHRcJnal2jqMFzYLJNBlhfXfe9bkKN7o",
  authDomain: "missed-call-text-responder-app.firebaseapp.com",
  projectId: "missed-call-text-responder-app",
  storageBucket: "missed-call-text-responder-app.firebasestorage.app",
  messagingSenderId: "471274821063",
  appId: "1:471274821063:web:a2e250113845118be775e2",
  measurementId: "G-Z7GC8Y1YK7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);