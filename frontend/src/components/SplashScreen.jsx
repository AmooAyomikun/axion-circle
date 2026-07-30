import { useEffect, useState } from 'react';
import splashBg from '../assets/image copy.png';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Read from sessionStorage to completely skip if already seen this session
    const hasSeenSplash = sessionStorage.getItem('splash_seen');
    if (hasSeenSplash) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const timer1 = setTimeout(() => {
      setIsFadingOut(true);
      sessionStorage.setItem('splash_seen', 'true');
    }, 400); // Wait 400ms before fading out

    const timer2 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 700); // 300ms fade transition

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#001310] transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Image (contains logo) */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <img fetchpriority="high" src={splashBg} alt="" width="400" height="800" className="w-full h-full object-cover md:object-contain md:max-w-md mx-auto" />
      </div>
    </div>
  );
}
