"use client";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // Add this import

const firebaseConfig = {
  apiKey: "AIzaSyBiNJ0bQvgvfjAC_Zpc7OWv8vfbNsKyR5w",
  authDomain: "ecommerce-chat-web-a1815.firebaseapp.com",
  projectId: "ecommerce-chat-web-a1815",
  storageBucket: "ecommerce-chat-web-a1815.firebasestorage.app",
  messagingSenderId: "338783026013",
  appId: "1:338783026013:web:cc82fedc06c8f4bc6ac6b4",
  measurementId: "G-DWEG7KJ6Y8",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp); // Export auth
