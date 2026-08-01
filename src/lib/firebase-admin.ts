import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './service-account.json';

initializeApp({
  credential: cert(serviceAccount as any),
  projectId: "digital-subs",
});

export const adminAuth = getAuth();
export const adminDb = getFirestore(undefined, 'default');
