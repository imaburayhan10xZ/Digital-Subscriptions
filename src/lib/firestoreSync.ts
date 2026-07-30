import { db } from './firebase.js';
import { doc, setDoc } from 'firebase/firestore';

let firestoreDisabled = false;

export async function syncToFirestore(dbData: any) {
  if (firestoreDisabled) return;
  try {
    if (!dbData) return;
    console.log('Syncing data to Firestore (digital-subs)...');

    const syncCollection = async (collectionName: string, items: any[]) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        if (item && item.id && !firestoreDisabled) {
          try {
            await setDoc(doc(db, collectionName, String(item.id)), item, { merge: true });
          } catch (err: any) {
            if (err?.message?.includes('NOT_FOUND') || err?.code === 'not-found' || err?.code === 5) {
              console.warn(`Firestore collection or database not found for project 'digital-subs'. Please ensure Firestore Database is created in your Firebase Console (https://console.firebase.google.com).`);
              firestoreDisabled = true;
              return;
            } else {
              console.error(`Error syncing item ${item.id} to ${collectionName}:`, err?.message || err);
            }
          }
        }
      }
    };

    await syncCollection('users', dbData.users);
    await syncCollection('products', dbData.products);
    await syncCollection('categories', dbData.categories);
    await syncCollection('orders', dbData.orders);
    await syncCollection('licenses', dbData.licenses);
    await syncCollection('downloads', dbData.downloads);
    await syncCollection('tutorials', dbData.tutorials);

    if (dbData.settings && !firestoreDisabled) {
      try {
        await setDoc(doc(db, 'settings', 'site_settings'), dbData.settings, { merge: true });
      } catch (err: any) {
        if (err?.message?.includes('NOT_FOUND') || err?.code === 'not-found' || err?.code === 5) {
          firestoreDisabled = true;
        }
      }
    }

    await syncCollection('manualSetupRequests', dbData.manualSetupRequests);

    if (!firestoreDisabled) {
      console.log('Successfully synced data to Firestore!');
    }
  } catch (err: any) {
    if (err?.message?.includes('NOT_FOUND') || err?.code === 'not-found' || err?.code === 5) {
      console.warn(`Firestore Database not found for project 'digital-subs'. Disabling sync until database is created in Firebase Console.`);
      firestoreDisabled = true;
    } else {
      console.error('Firestore sync error:', err?.message || err);
    }
  }
}

