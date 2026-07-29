import { useEffect, useState } from 'react';
import splashBg from '../assets/image copy.png';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2500); // Wait 2.5 seconds before fading out

    const timer2 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3000); // 500ms fade transition

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
        <img loading="lazy" src={splashBg} alt="" className="w-full h-full object-cover md:object-contain md:max-w-md mx-auto" />
      </div>
    </div>
  );
}
