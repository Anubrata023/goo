// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, get, update } from "firebase/database";
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

// Initialize Firebase safely
let app;
export let db: any;
export let auth: any;
try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase initialization failed. Running in standalone local storage database fallback mode:", e);
}

// Local Storage Helper Utilities to guarantee 100% demo robustness
const getLocalData = (key: string): any[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalData = (key: string, data: any[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage save failed:", e);
  }
};

// Helper: Write complaint to Firebase & localStorage
export const addComplaintToFeed = async (complaint: any) => {
  const localComplaint = {
    ...complaint,
    upvotes: complaint.upvotes || 0,
    timestamp: complaint.timestamp || Date.now(),
    id: complaint.id || `JS-${Date.now()}`
  };

  // 1. Save to LocalStorage
  const localList = getLocalData('local_complaints');
  localList.push(localComplaint);
  saveLocalData('local_complaints', localList);
  notifyComplaintListeners();

  // 2. Try Firebase write
  if (db) {
    try {
      const newRef = push(ref(db, 'complaints'));
      await set(newRef, {
        ...localComplaint,
        id: newRef.key
      });
      return newRef.key;
    } catch (e) {
      console.warn("Failed to write complaint to Firebase, using local storage fallback:", e);
    }
  }
  return localComplaint.id;
};

// Baseline demo complaints
export const mockDemoComplaints = [
  {
    id: "001",
    raw_text: "Hamare mohalle mein handpump 3 hafte se band hai, pani nahi aa raha",
    summary_en: "Water handpump broken in Lucknow ward for 3 weeks, causing immediate drinking water shortage.",
    category: "Water",
    ward: "Chinhat",
    priority_score: 78,
    status: "new",
    upvotes: 124,
    cluster_size: 1,
    lat: 26.8667,
    lng: 80.9962,
    estimated_affected: 3400,
    cost_estimate: 45000,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "002",
    raw_text: "The school in our area has no toilets — girls are dropping out",
    summary_en: "Local Kakori school lacks functioning sanitation toilets, leading to female student dropouts.",
    category: "Education",
    ward: "Kakori",
    priority_score: 82,
    status: "under_review",
    upvotes: 98,
    cluster_size: 1,
    lat: 26.8710,
    lng: 80.7811,
    estimated_affected: 5200,
    cost_estimate: 150000,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "003",
    raw_text: "Severe waterlogging and flooded road in Sarojini Nagar",
    summary_en: "Flooded road in Sarojini Nagar due to poor storm drainage, blocking local transit.",
    category: "Roads",
    ward: "Sarojini Nagar",
    priority_score: 71,
    status: "funds_allocated",
    upvotes: 45,
    cluster_size: 1,
    lat: 26.7812,
    lng: 80.8920,
    estimated_affected: 8900,
    cost_estimate: 350000,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "004",
    raw_text: "Bijli ka khamba toot gaya hai raat ko andhera rehta hai",
    summary_en: "Broken electricity pole in Alambagh causing blackouts and safety concerns at night.",
    category: "Electricity",
    ward: "Alambagh",
    priority_score: 68,
    status: "new",
    upvotes: 21,
    cluster_size: 1,
    lat: 26.8115,
    lng: 80.9124,
    estimated_affected: 1500,
    cost_estimate: 28000,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "005",
    raw_text: "Broken handpump in ward Chinhat - multiple citizens reporting",
    summary_en: "Merged handpump leakage complaints across Ward Chinhat, verified by vector cluster matching.",
    category: "Water",
    ward: "Chinhat",
    priority_score: 78,
    status: "new",
    upvotes: 256,
    cluster_size: 47,
    is_duplicate: true,
    lat: 26.8670,
    lng: 80.9959,
    estimated_affected: 12400,
    cost_estimate: 45000,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper: Listen to complaints in real-time
const activeComplaintListeners = new Set<(data: any[]) => void>();
let latestFirebaseComplaints: any[] = [];

export const getMergedComplaints = (firebaseData: any[] = []) => {
  const localList = getLocalData('local_complaints');
  const statusOverrides = getLocalData('complaints_status_overrides');
  const upvoteOverrides = getLocalData('complaints_upvote_overrides');
  
  // Map of id -> status
  const statusMap = new Map(statusOverrides.map(item => [item.id, item.status]));
  // Map of id -> upvote count
  const upvoteMap = new Map(upvoteOverrides.map(item => [item.id, item.count]));

  // If Firebase data is empty/not loaded, use mockDemoComplaints as baseline
  const baseData = firebaseData.length === 0 ? mockDemoComplaints : firebaseData;

  const merged = [...baseData, ...localList];
  const uniqueMap = new Map<string, any>();

  merged.forEach(c => {
    if (c && c.id) {
      const copy = { ...c };
      // Apply local status and upvote overrides if present
      if (statusMap.has(copy.id)) {
        copy.status = statusMap.get(copy.id);
      }
      if (upvoteMap.has(copy.id)) {
        copy.upvotes = upvoteMap.get(copy.id);
      }
      uniqueMap.set(copy.id, copy);
    }
  });

  return Array.from(uniqueMap.values());
};

const notifyComplaintListeners = () => {
  const merged = getMergedComplaints(latestFirebaseComplaints);
  activeComplaintListeners.forEach(cb => {
    try {
      cb(merged);
    } catch (e) {
      console.error("Error invoking real-time callback listener:", e);
    }
  });
};

export const listenToComplaints = (callback: (data: any[]) => void) => {
  activeComplaintListeners.add(callback);
  
  // Return local cache immediately
  callback(getMergedComplaints(latestFirebaseComplaints));

  if (!db) {
    return () => {
      activeComplaintListeners.delete(callback);
    };
  }

  const complaintsRef = ref(db, 'complaints');
  const unsubscribe = onValue(complaintsRef, (snapshot) => {
    const data = snapshot.val();
    let fbComplaints: any[] = [];
    if (data) {
      fbComplaints = Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        ...value
      }));
    }
    latestFirebaseComplaints = fbComplaints;
    notifyComplaintListeners();
  }, (err) => {
    console.warn("Firebase listener error, using local storage database:", err);
    notifyComplaintListeners();
  });

  return () => {
    activeComplaintListeners.delete(callback);
    unsubscribe();
  };
};

// Helper: Upvote a complaint (atomic increment)
export const upvoteComplaint = async (complaintId: string) => {
  // 1. Save to LocalStorage overrides
  const upvoteOverrides = getLocalData('complaints_upvote_overrides');
  const existing = upvoteOverrides.find(item => item.id === complaintId);
  
  if (existing) {
    existing.count = existing.count + 1;
  } else {
    upvoteOverrides.push({ id: complaintId, count: 125 }); // start from baseline upvotes
  }
  saveLocalData('complaints_upvote_overrides', upvoteOverrides);
  notifyComplaintListeners();

  // 2. Try Firebase update
  if (db) {
    const upvoteRef = ref(db, `complaints/${complaintId}/upvotes`);
    try {
      const snapshot = await get(upvoteRef);
      const current = snapshot.val() || 0;
      await set(upvoteRef, current + 1);
    } catch (error) {
      console.warn('Firebase upvote failed, relying on local storage fallback:', error);
    }
  }
};

// Helper: Update complaint status directly in Firebase & LocalStorage
export const updateComplaintStatusInFirebase = async (complaintId: string, newStatus: string) => {
  // 1. Update in LocalStorage status overrides
  const statusOverrides = getLocalData('complaints_status_overrides');
  const existingIndex = statusOverrides.findIndex(item => item.id === complaintId);
  if (existingIndex >= 0) {
    statusOverrides[existingIndex].status = newStatus;
  } else {
    statusOverrides.push({ id: complaintId, status: newStatus });
  }
  saveLocalData('complaints_status_overrides', statusOverrides);

  // Also update in local complaints list if it exists there
  const localList = getLocalData('local_complaints');
  const index = localList.findIndex(c => c.id === complaintId);
  if (index >= 0) {
    localList[index].status = newStatus;
    saveLocalData('local_complaints', localList);
  }
  
  notifyComplaintListeners();

  // 2. Try Firebase update
  if (db) {
    try {
      const complaintRef = ref(db, `complaints/${complaintId}`);
      await update(complaintRef, { status: newStatus, updatedAt: Date.now() });
      return true;
    } catch (error) {
      console.warn('Firebase status update failed, relying on local storage fallback:', error);
    }
  }
  return true;
};

// Helper: Post an admin update to the admin feed
export const postAdminFeedUpdate = async (post: {
  message: string;
  complaintId?: string;
  category?: string;
  ward?: string;
  type: 'update' | 'resolved' | 'alert' | 'fund';
  adminName: string;
}) => {
  const localPost = {
    ...post,
    timestamp: Date.now(),
    id: `POST-${Date.now()}`
  };

  // 1. Save to LocalStorage
  const localFeed = getLocalData('local_admin_feed');
  localFeed.push(localPost);
  saveLocalData('local_admin_feed', localFeed);

  // 2. Try Firebase update
  if (db) {
    try {
      const feedRef = push(ref(db, 'admin_feed'));
      await set(feedRef, {
        ...localPost,
        id: feedRef.key
      });
      return feedRef.key;
    } catch (e) {
      console.warn("Failed to write admin update to Firebase, using local storage:", e);
    }
  }
  return localPost.id;
};

// Helper: Listen to admin feed in real-time
export const listenToAdminFeed = (callback: (data: any[]) => void) => {
  const getMergedFeed = (firebaseFeed: any[] = []) => {
    const localFeed = getLocalData('local_admin_feed');
    const merged = [...firebaseFeed, ...localFeed];
    const uniqueMap = new Map<string, any>();
    merged.forEach(post => {
      if (post && post.id) {
        uniqueMap.set(post.id, post);
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => b.timestamp - a.timestamp);
  };

  // Return local cache immediately
  callback(getMergedFeed([]));

  if (!db) {
    return () => {};
  }

  const feedRef = ref(db, 'admin_feed');
  return onValue(feedRef, (snapshot) => {
    const data = snapshot.val();
    let fbFeed: any[] = [];
    if (data) {
      fbFeed = Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        ...value
      }));
    }
    callback(getMergedFeed(fbFeed));
  }, (err) => {
    console.warn("Firebase admin feed listener failed, using local cache:", err);
    callback(getMergedFeed([]));
  });
};