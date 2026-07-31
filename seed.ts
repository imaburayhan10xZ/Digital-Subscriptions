import { syncToFirestore } from './src/lib/firestoreSync.js';

const demoData = {
  users: [
    { 
      id: 'aburayhan10x@gmail.com', 
      email: 'aburayhan10x@gmail.com', 
      name: 'Admin', 
      role: 'ADMIN',
      isVerified: true
    }
  ],
  products: [
    { id: 'prod_1', name: 'Premium ApexBoost', price: 99.99 }
  ],
  settings: { siteName: 'ApexBoost' },
  categories: [],
  orders: [],
  licenses: [],
  downloads: [],
  tutorials: [],
  manualSetupRequests: []
};

async function seed() {
  console.log('Starting seed...');
  await syncToFirestore(demoData);
  console.log('Demo data seeded!');
}

seed();
