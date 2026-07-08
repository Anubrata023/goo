// src/hooks/useRealtime.ts
import { useState, useEffect } from 'react';
import { listenToComplaints } from '../firebase';

const mockDemoComplaints = [
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

export function useRealtimeComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolved = false;

    // Timeout fallback after 1.5 seconds if Firebase is slow/errors out
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn("Firebase connection timed out; falling back to local simulation database.");
        setComplaints(mockDemoComplaints);
        setLoading(false);
        resolved = true;
      }
    }, 1500);

    const unsubscribe = listenToComplaints((data) => {
      if (!resolved) {
        clearTimeout(timeout);
        // If Firebase database is empty, seed it with mock complaints so it matches demo
        if (data.length === 0) {
          setComplaints(mockDemoComplaints);
        } else {
          setComplaints(data);
        }
        setLoading(false);
        resolved = true;
      }
    });
    
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  return { complaints, loading };
}