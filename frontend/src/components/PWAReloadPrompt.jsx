import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PWAReloadPrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 5 minutes instead of 1 hour
      // This ensures when you push to Github, users get it within 5 mins max
      if (r) {
        setInterval(() => {
          r.update();
        }, 5 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      // The user explicitly requested seamless, automatic updates
      // As soon as a new version is downloaded by the service worker,
      // this triggers it to skip waiting and reloads the current page automatically!
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
