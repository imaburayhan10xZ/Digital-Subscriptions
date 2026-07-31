import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDUmN8a_aMiRL5tnZqlVA2ySoPOxX-Gtzk",
  authDomain: "caramel-poet-vgxqk.firebaseapp.com",
  projectId: "caramel-poet-vgxqk",
  storageBucket: "caramel-poet-vgxqk.firebasestorage.app",
  messagingSenderId: "858474249110",
  appId: "1:858474249110:web:ef9c60b0d204af3a963bb7",
  measurementId: ""
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-apexboostsaas-c67262d2-9530-4609-ae87-eb3c442a19f1");
export const auth = getAuth(app);

