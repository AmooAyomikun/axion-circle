import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function StateCard({
  icon: Icon,
  iconClassName = 'text-red-500',
  iconBgClassName = 'bg-red-50 border-red-100',
  title,
  description,
  errorDetails,
  actionLabel = 'Retry',
  onAction,
  actionIcon: ActionIcon = RefreshCw,
  className = ''
}) {
  return (
    <div className={`w-full h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>
      {Icon && (
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border ${iconBgClassName}`}>
          <Icon className={`w-10 h-10 ${iconClassName}`} strokeWidth={2} />
        </div>
      )}
      
      <h2 className="text-3xl font-bold text-gray-900 mb-3 font-heading text-center">
        {title}
      </h2>
      
      <div className="flex flex-col items-center text-center max-w-[500px] mb-8">
        {description && (
          <p className="text-gray-500 text-base leading-relaxed">
            {description}
          </p>
        )}
        {errorDetails && (
          <p className="text-gray-400 text-sm font-medium mt-1.5">
            {errorDetails}
          </p>
        )}
      </div>

      {onAction && (
        <button 
          onClick={onAction}
          className="flex items-center justify-center gap-2 px-10 py-3 bg-[#127C2F] text-white font-bold text-sm rounded-lg hover:bg-[#127C2F]/90 transition-colors shadow-sm min-w-[160px]"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
