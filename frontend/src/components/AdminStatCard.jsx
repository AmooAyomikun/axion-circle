import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminStatCard({ 
  title, 
  value, 
  trend, 
  paths, 
  icon: Icon, 
  iconColorClass, 
  iconBgClass 
}) {
  return (
    <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-full shrink-0">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgClass}`}>
            <Icon className={`w-5 h-5 ${iconColorClass}`} />
          </div>
          <p className="text-sm font-bold text-paragraph">{title}</p>
        </div>
        <button className="text-black-icon hover:text-black transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>

      <div className="flex items-baseline gap-3 mt-auto relative z-10">
        <span className="text-[28px] font-bold text-black tracking-tight leading-none">{value}</span>
        <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${!trend?.isPositive ? 'text-primary' : 'text-alert-success'}`}>
          {!trend?.isPositive ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />} {trend?.percentage}%
        </span>
      </div>

      {paths?.path && (
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none translate-x-4 translate-y-2">
          <svg width="120" height="48" viewBox="0 0 120 48" className="overflow-visible">
            <path d={paths.fillPath} fill="currentColor" className={iconColorClass} />
            <path d={paths.path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass} />
          </svg>
        </div>
      )}
    </div>
  );
}
