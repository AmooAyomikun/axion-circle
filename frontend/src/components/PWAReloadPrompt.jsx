import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import toast from 'react-hot-toast';

export default function PWAReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Periodic check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast(
        (t) => (
          <div className="flex flex-col gap-3">
            <span className="font-medium text-sm text-gray-800">
              A new version of CleanReport is available!
            </span>
            <div className="flex gap-2">
              <button
                className="bg-primary text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
                onClick={() => {
                  updateServiceWorker(true);
                  toast.dismiss(t.id);
                }}
              >
                Update & Reload
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setNeedRefresh(false);
                  toast.dismiss(t.id);
                }}
              >
                Later
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity, // Don't auto-dismiss
          position: 'bottom-right',
          id: 'pwa-update-toast',
        }
      );
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh]);

  return null;
}
