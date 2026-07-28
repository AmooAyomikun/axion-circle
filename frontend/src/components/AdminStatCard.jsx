import React from 'react';
import { ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';

export default function AdminStatCard({ 
  title, 
  value, 
  trend, 
  paths, 
  icon: Icon, 
  iconColorClass, 
  iconBgClass,
  svgFillColor,
  svgStrokeColor
}) {
  // Map icon classes to exact SVG stroke/fill colors based on the original design
  let svgFill = svgFillColor || "#E9FFEA";
  let svgStroke = svgStrokeColor || "#127C2F";
  
  if (!svgFillColor) {
    if (iconBgClass.includes('bg-primary') || iconBgClass.includes('text-[#10B981]')) {
      svgFill = "#FFE8E8";
      svgStroke = "#DB0404";
    } else if (iconBgClass.includes('bg-[#F59E0B]')) {
      svgFill = "#FFF4E5";
      svgStroke = "#F59E0B";
    } else if (iconBgClass.includes('bg-paragraph') || iconBgClass.includes('bg-gray')) {
      svgFill = "#F3F4F6";
      svgStroke = "#9CA3AF";
    }
  }

  // The original design had specific colored backgrounds and text colors for the trend arrows
  // based on whether the trend was positive or negative.
  const isPositive = trend?.isPositive ?? true;
  const trendColor = isPositive ? 'text-primary' : 'text-[#DB0404]';
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[240px] md:w-auto shrink-0 snap-center">
      {/* Background SVG Sparkline positioned absolutely at the bottom right */}
      {paths?.path && (
        <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
          <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
            <path d={paths.fillPath} fill={svgFill} />
            <path d={paths.path} fill="none" stroke={svgStroke} strokeWidth="1.5" strokeOpacity="0.4" />
          </svg>
        </div>
      )}

      {/* Top Header with Icon and Options Menu */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${iconBgClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-black">{title}</span>
        </div>
        <button className="text-black-icon hover:text-black shrink-0 transition-colors" aria-label="More options">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Values and Trend */}
      <div className="flex items-baseline gap-3 mt-auto relative z-10">
        <span className="text-[28px] font-bold text-black tracking-tight leading-none">{value}</span>
        <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" /> {trend?.percentage || 0}%
        </span>
      </div>
    </div>
  );
}
