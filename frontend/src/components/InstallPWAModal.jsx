import React from 'react';
import { X, Smartphone, Apple, Chrome, Share, Download } from 'lucide-react';

export default function InstallPWAModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#001310]/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-heading font-bold text-[#001310] flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Install CleanReport
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 rounded-lg hover:bg-gray-100"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-paragraph text-sm mb-6">
            CleanReport is a Progressive Web App (PWA). You can install it directly on your device for a native app experience, offline access, and instant notifications—without needing the App Store or Google Play.
          </p>

          <div className="space-y-4">
            {/* iOS Instructions */}
            <div className="bg-[#f7f8f2] p-4 rounded-xl border border-gray-100">
              <h3 className="font-bold text-[#001310] flex items-center gap-2 mb-2">
                <Apple className="w-4 h-4" /> For iOS (Safari)
              </h3>
              <ol className="text-sm text-paragraph list-decimal list-inside space-y-2 ml-1">
                <li>Tap the <Share className="w-4 h-4 inline-block mx-1 text-primary" /> Share button in the toolbar.</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                <li>Tap <strong>"Add"</strong> in the top right corner.</li>
              </ol>
            </div>

            {/* Android Instructions */}
            <div className="bg-[#f7f8f2] p-4 rounded-xl border border-gray-100">
              <h3 className="font-bold text-[#001310] flex items-center gap-2 mb-2">
                <Chrome className="w-4 h-4" /> For Android (Chrome)
              </h3>
              <ol className="text-sm text-paragraph list-decimal list-inside space-y-2 ml-1">
                <li>Tap the <span className="font-bold text-lg inline-block leading-none -translate-y-1">⋮</span> menu icon in the top right.</li>
                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>Confirm by tapping <strong>"Install"</strong>.</li>
              </ol>
            </div>
            
            {/* Desktop Instructions */}
            <div className="bg-[#f7f8f2] p-4 rounded-xl border border-gray-100">
              <h3 className="font-bold text-[#001310] flex items-center gap-2 mb-2">
                <Download className="w-4 h-4" /> For Desktop
              </h3>
              <p className="text-sm text-paragraph ml-1">
                Look for the install icon <Download className="w-4 h-4 inline-block mx-1 text-primary" /> in the right side of your address bar and click it to install.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-[#001310] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#001310]/90 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
