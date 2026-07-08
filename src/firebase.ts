// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, get } from "firebase/database";
import { getAuth } from "firebase/auth";

// These keys pull from your .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// Helper: Write complaint to Firebase (for real-time feed)
export const addComplaintToFeed = async (complaint: any) => {
  const newRef = push(ref(db, 'complaints'));
  await set(newRef, {
    ...complaint,
    upvotes: 0,
    timestamp: Date.now()
  });
  return newRef.key;
};

// Helper: Listen to complaints in real-time
export const listenToComplaints = (callback: (data: any) => void) => {
  const complaintsRef = ref(db, 'complaints');
  return onValue(complaintsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const complaints = Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        ...value
      }));
      callback(complaints);
    } else {
      callback([]);
    }
  });
};

// Helper: Upvote a complaint (atomic increment)
export const upvoteComplaint = async (complaintId: string) => {
  const upvoteRef = ref(db, `complaints/${complaintId}/upvotes`);
  try {
    const snapshot = await get(upvoteRef);
    const current = snapshot.val() || 0;
    await set(upvoteRef, current + 1);
  } catch (error) {
    console.error('Upvote failed:', error);
  }
};