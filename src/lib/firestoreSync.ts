import { adminDb } from './firebase-admin.js';

let firestoreDisabled = false;

export async function syncToFirestore(dbData: any) {
  if (firestoreDisabled) return;
  try {
    if (!dbData) return;

    const syncCollection = async (collectionName: string, items: any[]) => {
      if (!Array.isArray(items) || firestoreDisabled) return;
      for (const item of items) {
        if (item && item.id && !firestoreDisabled) {
          try {
            await adminDb.collection(collectionName).doc(String(item.id)).set(item, { merge: true });
          } catch (err: any) {
            firestoreDisabled = true;
            console.warn(`Firestore sync disabled for ${collectionName}:`, err?.message || err);
            return;
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
    await syncCollection('notifications', dbData.notifications);

    if (dbData.settings && !firestoreDisabled) {
      try {
        await adminDb.collection('settings').doc('site_settings').set(dbData.settings, { merge: true });
      } catch (err: any) {
        firestoreDisabled = true;
      }
    }

    await syncCollection('manualSetupRequests', dbData.manualSetupRequests);

    if (!firestoreDisabled) {
      console.log('Successfully synced data to Firestore!');
    }
  } catch (err: any) {
    firestoreDisabled = true;
    console.warn('Firestore sync stopped:', err?.message || err);
  }
}


