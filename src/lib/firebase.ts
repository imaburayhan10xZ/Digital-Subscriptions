import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBt5k-SNFTP5aDLDg2pt8DhRdqyZrR-4d4",
  authDomain: "digital-subs.firebaseapp.com",
  projectId: "digital-subs",
  storageBucket: "digital-subs.firebasestorage.app",
  messagingSenderId: "255188257688",
  appId: "1:255188257688:web:40c466ae3e94b4ad05f9ed",
  measurementId: "G-EHFMVSFQY5"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, "(default)");
export const auth = getAuth(app);

