import React, { useState, useRef, useEffect } from 'react';
import { getCountryCallingCode } from 'react-phone-number-input';
import { ChevronDown } from 'lucide-react';

export default function CustomCountrySelect({ value, onChange, options, iconComponent: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative flex items-center h-full mr-2" ref={containerRef}>
      <button
        type="button"
        className="flex items-center gap-1.5 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-5 h-3.5 flex items-center justify-center overflow-hidden rounded-[2px] shadow-sm">
          {Icon && value && <Icon country={value} label={selectedOption?.label} />}
          {!value && <div className="w-5 h-3.5 bg-gray-200 rounded-[2px]"></div>}
        </div>
        <ChevronDown className="w-3 h-3 text-black-icon" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[85px] max-h-60 overflow-y-auto bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white-stroke z-50 py-1 custom-scrollbar">
          {options.map((option) => {
            if (option.divider) {
              return null; // Figma doesn't show dividers
            }
            if (!option.value) return null; // Skip "International" without a flag for this design
            
            let callingCode = '';
            try {
              callingCode = getCountryCallingCode(option.value);
            } catch (e) {
              return null;
            }

            return (
              <button
                key={option.value}
                type="button"
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${value === option.value ? 'bg-gray-100' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <div className="w-5 h-3.5 flex items-center justify-center overflow-hidden shrink-0 rounded-[2px] shadow-sm">
                  {Icon && <Icon country={option.value} label={option.label} />}
                </div>
                <span className="text-black font-medium">
                  +{callingCode}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
