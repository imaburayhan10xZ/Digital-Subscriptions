import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: applicationDefault(),
  projectId: "digital-subs",
});

export const adminAuth = getAuth();
export const adminDb = getFirestore(undefined, 'default');
