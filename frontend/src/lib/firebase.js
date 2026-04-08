import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAO2ma2v8Nf9YWXxrdEBc0YC5OQ_exF2hg",
  authDomain: "resource-share-22049.firebaseapp.com",
  projectId: "resource-share-22049",
  storageBucket: "resource-share-22049.firebasestorage.app",
  messagingSenderId: "639803366158",
  appId: "1:639803366158:web:17f651d0cf49e4d6a1d55f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

