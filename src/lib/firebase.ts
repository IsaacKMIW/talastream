import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCvi9jF_UHBYwN3BYXczO9UftVrQ7My6xY",
  authDomain: "talastream-83a6b.firebaseapp.com",
  projectId: "talastream-83a6b",
  storageBucket: "talastream-83a6b.firebasestorage.app",
  messagingSenderId: "1037546130853",
  appId: "1:1037546130853:web:5aa2055840e988442fec4c",
  measurementId: "G-6BN3B6R1RK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);