import { useState, useEffect } from 'react';
import { WifiOff, X, RefreshCw } from 'lucide-react';

export default function ConnectionLostModal() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsDismissed(false);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline || isDismissed) return null;

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOffline(false);
    } else {
      // Still offline, but maybe we try to close it or keep it open
      // Since it's a Retry Sync button, we'll try to check connection
      setIsOffline(!navigator.onLine);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDismissed(true)}></div>
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-[24px] shadow-2xl relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-200 p-6 sm:p-8 text-center">
        <button 
          onClick={() => setIsDismissed(true)} 
          className="absolute top-4 right-4 text-black-icon hover:text-black transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Concentric red circles with WifiOff icon */}
        <div className="w-20 h-20 bg-[#ffeceb] rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full border border-[#fdd8d6] scale-110"></div>
          <div className="absolute inset-0 rounded-full border border-[#fdd8d6] scale-125 opacity-50"></div>
          <WifiOff className="w-8 h-8 text-[#E51B1B]" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 font-heading tracking-tight">
          Connection Lost
        </h2>
        
        <p className="text-[13px] sm:text-sm text-paragraph mb-8 leading-relaxed px-2">
          You can still view cached reports and add manual entries. New entries will be synced automatically once your connection is restored.
        </p>

        <button 
          onClick={handleRetry}
          className="w-full py-3.5 bg-primary text-white rounded-xl text-sm sm:text-base font-bold shadow-sm hover:bg-primary/90 transition-colors active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry sync Now
        </button>
      </div>
    </div>
  );
}
