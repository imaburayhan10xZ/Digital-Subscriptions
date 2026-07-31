import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import config from '../../firebase-applet-config.json';

initializeApp({
  projectId: config.projectId,
});

export const adminAuth = getAuth();
export const adminDb = getFirestore();
