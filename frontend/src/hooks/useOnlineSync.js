import { useState, useEffect } from 'react';
import { getPendingReports, removePendingReport, getPendingCount } from '../services/offlineQueue';
import { uploadToCloudinary } from '../services/cloudinary';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useOnlineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateCount = async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch (err) {
      console.error('Failed to get pending count:', err);
    }
  };

  const syncPendingReports = async () => {
    if (isSyncing || !navigator.onLine) return;
    
    try {
      const count = await getPendingCount();
      if (count === 0) return;
      
      setIsSyncing(true);
      const reports = await getPendingReports();
      let successCount = 0;

      for (const report of reports) {
        try {
          // Upload photo if it's a File/Blob, otherwise use existing photoUrl
          let photoUrl = report.photoUrl;
          if (report.photo instanceof Blob || report.photo instanceof File) {
            photoUrl = await uploadToCloudinary(report.photo);
          } else if (report.photo && typeof report.photo === 'string') {
            photoUrl = report.photo;
          }

          const payload = {
            title: report.title,
            photoUrl: photoUrl,
            latitude: report.latitude,
            longitude: report.longitude,
            category: report.category,
            description: report.description,
            address: report.address,
            urgency: report.urgency,
            isAnonymous: report.isAnonymous,
          };

          await api.post('/reports', payload);
          // If successful, remove from queue
          await removePendingReport(report.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync report ${report.id}:`, error);
          // Leave it in the queue to retry later
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully synced ${successCount} offline report${successCount !== 1 ? 's' : ''}!`);
      }
    } finally {
      await updateCount();
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingReports();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Delay initial sync/count check to not compete with page render
    const initTimer = setTimeout(() => {
      updateCount();
      if (navigator.onLine) {
        syncPendingReports();
      }
    }, 4000); // 4s delay — page should be fully interactive by then

    // Periodic count refresh (every 60s is sufficient)
    const intervalId = setInterval(() => {
      if (navigator.onLine) updateCount();
    }, 60000);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return { isOnline, pendingCount, syncPendingReports, updateCount };
};
