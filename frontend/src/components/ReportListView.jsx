import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const ReportListView = React.memo(function ReportListView({ reports }) {
  if (!reports || reports.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white p-6 text-center">
        <p className="text-paragraph font-medium">No reports yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white overflow-y-auto z-0">
      {reports.map((report, idx) => {
        const status = (report.status || 'reported').toLowerCase().replace(/[_ ]/g, '');
        const isResolved = status === 'resolved';
        const isInProgress = status === 'inprogress';
        const isAcknowledged = status === 'acknowledged';

        // Design colors for pills
        const statusClass = isResolved ? 'bg-[#E9FFEA] text-[#127C2F]' :
                            isInProgress ? 'bg-[#F4EBFF] text-[#A855F7]' :
                            isAcknowledged ? 'bg-[#E5F0FF] text-[#006FED]' :
                            'bg-[#FFF5EB] text-[#F59E0B]';

        let statusText = report.status || 'Reported';
        // Capitalize first letter, lowercase rest
        statusText = statusText.charAt(0).toUpperCase() + statusText.slice(1).toLowerCase();
        
        if (isResolved && !statusText.includes('🎉')) {
          statusText = 'Resolved 🎉';
        }

        const dateObj = new Date(report.createdAt || report.date || Date.now());
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return (
          <Link 
            key={report.id} 
            to={`/reports/${report.id}`}
            className={`block py-4 ${idx !== reports.length - 1 ? 'border-b border-white-stroke' : ''} hover:bg-gray-50 transition-colors px-1`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusClass}`}>
                {statusText}
              </span>
              <span className="text-[10px] font-bold text-black-placeholder">
                {dateStr}
              </span>
            </div>
            
            <h3 className="text-sm font-extrabold text-black mb-1 leading-tight truncate">
              {report.title || report.category || 'Sanitation Issue'}
            </h3>
            
            <div className="flex items-center gap-1.5 text-[11px] text-paragraph mt-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {(report.address || report.areaName || '').includes('Location unavailable') 
                  ? 'Location not automatically captured' 
                  : (report.address || report.areaName || 'Location not captured')}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
});

export default ReportListView;
