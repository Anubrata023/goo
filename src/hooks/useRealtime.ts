// src/hooks/useRealtime.ts
import { useState, useEffect } from 'react';
import { listenToComplaints, getMergedComplaints } from '../firebase';

export function useRealtimeComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolved = false;

    // Timeout fallback after 1.5 seconds if Firebase is slow/errors out
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn("Firebase connection timed out; falling back to local simulation database.");
        setComplaints(getMergedComplaints([]));
        setLoading(false);
        resolved = true;
      }
    }, 1500);

    const unsubscribe = listenToComplaints((data) => {
      clearTimeout(timeout);
      setComplaints(data);
      setLoading(false);
      resolved = true;
    });
    
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  return { complaints, loading };
}