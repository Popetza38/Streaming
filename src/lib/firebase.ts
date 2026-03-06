import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANYpfR2Wvkm3rFoFSDGAFkzmY1isbT8Rk",
  authDomain: "drama-68f94.firebaseapp.com",
  projectId: "drama-68f94",
  storageBucket: "drama-68f94.firebasestorage.app",
  messagingSenderId: "712488016951",
  appId: "1:712488016951:web:9794358ae491af6e20f3b2",
  measurementId: "G-CT6GER6VP7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
