
import { adminDb } from './src/lib/firebase-admin';

async function seedDatabase() {
  console.log("Seeding database...");
  
  const collectionsToCreate = [
    { path: "users/placeholder", data: { info: "First user signup placeholder" } },
    { path: "products/placeholder", data: { name: "Sample Product", price: 0 } },
    { path: "categories/placeholder", data: { name: "General" } },
    { path: "orders/placeholder", data: { status: "pending" } },
    { path: "licenses/placeholder", data: { key: "SAMPLE-LICENSE-KEY" } },
    { path: "downloads/placeholder", data: { fileName: "guide.pdf" } },
    { path: "tickets/placeholder", data: { subject: "Welcome Support Ticket" } },
    { path: "announcements/placeholder", data: { title: "Welcome to our platform!" } },
    { path: "coupons/placeholder", data: { code: "WELCOME10", discountPercent: 10 } },
    { path: "redeemKeys/placeholder", data: { key: "REDEEM-XYZ-123" } },
    { path: "referrals/placeholder", data: { referrerUid: "placeholder" } },
    { path: "settings/site_settings", data: { maintenanceMode: false, siteName: "Digital Subs" } },
    { path: "logs/placeholder", data: { message: "Database initialized successfully", timestamp: new Date() } },
    { path: "notifications/placeholder", data: { title: "Welcome!", body: "Thanks for joining." } },
    { path: "tutorials/placeholder", data: { title: "How to use our platform" } },
    { path: "manualSetupRequests/placeholder", data: { status: "pending", requestedAt: new Date() } }
  ];

  try {
    for (const item of collectionsToCreate) {
      await adminDb.doc(item.path).set(item.data, { merge: true });
      console.log(`Created collection/document path: ${item.path}`);
    }
    console.log("All collections initialized successfully!");
  } catch (error) {
    console.error("Error initializing collections:", error);
  }
}

seedDatabase();
