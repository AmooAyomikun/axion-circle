import { useEffect, useState } from 'react';
import splashLogo from '../assets/splash logo.png';
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
      {/* Background Decorative Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src={splashBg} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Main Logo Container */}
      <div className="relative z-10 animate-in fade-in zoom-in duration-700 delay-150 flex justify-center items-center px-6">
        <img src={splashLogo} alt="CleanReport Splash" className="w-64 sm:w-[320px] md:w-[400px] lg:w-[500px] h-auto object-contain" />
      </div>
    </div>
  );
}
