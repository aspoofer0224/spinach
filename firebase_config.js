// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import the storage function

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCee0rpGYjKFVn0b0GtuVWu9DFQGiPeF6w",
  authDomain: "spinach-3f381.firebaseapp.com",
  projectId: "spinach-3f381",
  storageBucket: "spinach-3f381.appspot.com",
  messagingSenderId: "388730275075",
  appId: "1:388730275075:web:b547ac442d838ec23e9536",
  measurementId: "G-QSYYGEW9LJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const FIREBASE_AUTH = getAuth(app);
export const FIRESTORE_DB = getFirestore(app);
export const FIREBASE_STORAGE = getStorage(app); // Initialize and export the storage instance
