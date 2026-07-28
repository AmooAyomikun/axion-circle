import { useState, useEffect } from 'react';

export default function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkIsPWA = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')
      );
    };

    setIsPWA(checkIsPWA());

    // Listen for changes in display mode (e.g., if user installs while app is open)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e) => {
      setIsPWA(e.matches);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // Fallback for older Safari
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return isPWA;
}
