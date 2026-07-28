import { useEffect, useState } from 'react';
import NavbarLogo from './NavbarLogo';

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
      {/* Background Decorative Leaves */}
      <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] opacity-[0.03] rotate-[30deg] pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-white w-full h-full">
          <path d="M100 0C100 0 200 50 200 100C200 150 100 200 100 200C100 200 0 150 0 100C0 50 100 0 100 0Z" />
        </svg>
      </div>
      
      <div className="absolute bottom-[-10%] right-[-20%] w-[90vw] h-[90vw] opacity-[0.02] rotate-[-20deg] pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-white w-full h-full">
          <path d="M100 0C100 0 200 50 200 100C200 150 100 200 100 200C100 200 0 150 0 100C0 50 100 0 100 0Z" />
        </svg>
      </div>

      {/* Main Logo Container */}
      <div className="relative z-10 animate-in fade-in zoom-in duration-700 delay-150">
        <NavbarLogo className="w-64 sm:w-80 h-auto object-contain" />
      </div>
    </div>
  );
}
