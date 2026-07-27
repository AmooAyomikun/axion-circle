import { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp,
  Search, 
  Filter, 
  Trash2, 
  Droplet, 
  Zap, 
  X,
  MoreVertical,
  Eye,
  Info,
  FileText,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const urgencyConfig = {
  high: { text: 'text-alert-error', label: 'Critical' },
  critical: { text: 'text-alert-error', label: 'Critical' },
  medium: { text: 'text-[#F59E0B]', label: 'Urgent' },
  urgent: { text: 'text-[#F59E0B]', label: 'Urgent' },
  low: { text: 'text-[#3B82F6]', label: 'Routine' },
  routine: { text: 'text-[#3B82F6]', label: 'Routine' }
};

const statusConfig = {
  resolved: { bg: 'bg-[#E9FFEA]', text: 'text-[#127C2F]', border: 'border-[#127C2F]/20', dot: 'bg-[#127C2F]', label: 'Resolved' },
  'in progress': { bg: 'bg-[#F3E8FF]', text: 'text-[#9333EA]', border: 'border-[#9333EA]/20', dot: 'bg-[#9333EA]', label: 'In Progress' },
  inprogress: { bg: 'bg-[#F3E8FF]', text: 'text-[#9333EA]', border: 'border-[#9333EA]/20', dot: 'bg-[#9333EA]', label: 'In Progress' },
  acknowledged: { bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/20', dot: 'bg-[#3B82F6]', label: 'Acknowledged' },
  reported: { bg: 'bg-[#FFF4E5]', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/20', dot: 'bg-[#F59E0B]', label: 'Pending' },
  pending: { bg: 'bg-[#FFF4E5]', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/20', dot: 'bg-[#F59E0B]', label: 'Pending' }
};

export default function AdminReportsTable({ reports, pageData, filters, onFilterChange, onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSort = (column) => {
    if (!['category', 'createdAt', 'status'].includes(column)) return;
    let direction = 'desc';
    if (filters?.sortBy === column && filters?.direction === 'desc') {
      direction = 'asc';
    }
    onFilterChange(prev => ({ ...prev, sortBy: column, direction, page: 0 }));
  };

  const openStatusModal = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status || 'REPORTED');
    setNote('');
    setModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedReport) return;
    try {
      setIsUpdating(true);
      await api.put(`/reports/${selectedReport.id}/status`, {
        status: newStatus,
        note: note
      });
      toast.success('Status updated successfully');
      setModalOpen(false);
      setShowSuccessModal(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPages = pageData?.totalPages || 1;
  const paginatedReports = reports || [];
  const currentPage = (filters?.page || 0) + 1;
  const itemsPerPage = filters?.size || 5;
  const totalElements = pageData?.totalElements || 0;

  const SortIcon = ({ column }) => {
    if (!['category', 'createdAt', 'status'].includes(column)) return null;
    if (filters?.sortBy !== column) return <ChevronDown className="w-3 h-3 text-paragraph opacity-50" />;
    return filters?.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Filters (Outside the table card) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm font-semibold text-black">Status</span>
            <div className="relative">
              <select 
                value={filters?.status || ''}
                onChange={(e) => onFilterChange(prev => ({ ...prev, status: e.target.value, page: 0 }))}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-white-stroke rounded-xl text-sm font-medium text-black outline-none focus:border-primary shadow-sm"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                aria-label="Filter by status"
              >
                <option value="">All Status</option>
                <option value="REPORTED">Reported</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm font-semibold text-black">Category</span>
            <div className="relative">
              <select 
                value={filters?.category || ''}
                onChange={(e) => onFilterChange(prev => ({ ...prev, category: e.target.value, page: 0 }))}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-white-stroke rounded-xl text-sm font-medium text-black outline-none focus:border-primary shadow-sm"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                <option value="OVERFLOW">Overflow</option>
                <option value="ILLEGAL_DUMPING">Illegal Dumping</option>
                <option value="BLOCKED_DRAIN">Blocked Drain</option>
                <option value="STREET_LITTER">Street Litter</option>
                <option value="RESIDENTIAL_DUMP">Residential Dump</option>
                <option value="COMMERCIAL_DUMP">Commercial Dump</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm font-semibold text-black">Sort</span>
            <div className="relative">
              <select 
                value={filters?.direction || 'desc'}
                onChange={(e) => onFilterChange(prev => ({ ...prev, sortBy: 'createdAt', direction: e.target.value, page: 0 }))}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-white-stroke rounded-xl text-sm font-medium text-black outline-none focus:border-primary shadow-sm"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                aria-label="Sort by"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
        <button className="px-4 py-2.5 bg-white border border-white-stroke rounded-xl text-sm font-medium text-black flex items-center gap-2 hover:bg-white-bg shadow-sm shrink-0">
          <Filter className="w-4 h-4 text-black-icon" /> Advanced Filter
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-white-stroke rounded-2xl shadow-sm flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="p-4 sm:p-5 border-b border-white-stroke">
          <h2 className="font-heading font-bold text-lg text-black">Recent Reports</h2>
        </div>

      {/* Table Content */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-white-stroke text-xs font-semibold text-paragraph">
              <th className="px-5 py-4 cursor-pointer whitespace-nowrap" onClick={() => handleSort('category')}>
                <div className="flex items-center gap-2">
                  <input type="checkbox" aria-label="Select all reports" className="w-4 h-4 rounded border-white-stroke text-primary focus:ring-primary" />
                  Category <SortIcon column="category" />
                </div>
              </th>
              <th className="px-5 py-4 cursor-pointer whitespace-nowrap" onClick={() => handleSort('reference')}>
                <div className="flex items-center gap-1">Reference ID <SortIcon column="reference" /></div>
              </th>
              <th className="px-5 py-4 cursor-pointer whitespace-nowrap" onClick={() => handleSort('urgency')}>
                <div className="flex items-center gap-1">Urgency <SortIcon column="urgency" /></div>
              </th>
              <th className="px-5 py-4 cursor-pointer whitespace-nowrap" onClick={() => handleSort('area')}>
                <div className="flex items-center gap-1">Area <SortIcon column="area" /></div>
              </th>
              <th className="px-5 py-4 cursor-pointer whitespace-nowrap" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center gap-1">Date Reported <SortIcon column="createdAt" /></div>
              </th>
              <th className="px-5 py-4 cursor-pointer whitespace-nowrap" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">Status <SortIcon column="status" /></div>
              </th>
              <th className="px-5 py-4 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white-stroke text-sm">
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-8 text-center text-paragraph">No reports found matching criteria</td>
              </tr>
            ) : (
              paginatedReports.map((report) => {
                const s = (report.status || 'Reported').toLowerCase();
                const statusTheme = statusConfig[s] || statusConfig.reported;
                
                const u = (report.urgency || 'medium').toLowerCase();
                const urgencyTheme = urgencyConfig[u] || urgencyConfig.medium;

                const rawDate = report.createdAt || report.date;
                const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';

                const catName = report.category ? report.category.replace(/_/g, ' ') : (report.title || 'Sanitation Issue');

                return (
                  <tr key={report.id} className="hover:bg-white-bg/50 transition-colors bg-white">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" aria-label={`Select report ${report.id}`} className="w-4 h-4 rounded border-white-stroke text-primary focus:ring-primary" />
                        <img 
                          src={(report.images && report.images.length > 0) ? report.images[0] : 'https://placehold.co/100x100/F3F4F6/9CA3AF?text=Report'} 
                          alt={catName}
                          className="w-10 h-10 rounded-lg object-cover bg-white-bg2 shrink-0 border border-white-stroke"
                        />
                        <span className="font-bold text-black capitalize">{catName.toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-black-icon">
                      {report.id ? `#CR-${report.id.substring(0, 4).toUpperCase()}` : 'N/A'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-medium capitalize ${urgencyTheme.text}`}>
                        {urgencyTheme.label || report.urgency || 'Medium'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-black font-medium">
                      {report.areaName || report.address || 'Unknown'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-paragraph font-medium">{formattedDate}</span>
                        <span className="text-paragraph text-xs">{rawDate ? new Date(rawDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button 
                        onClick={() => openStatusModal(report)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border cursor-pointer hover:opacity-80 transition-opacity ${statusTheme.bg} ${statusTheme.text} ${statusTheme.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusTheme.dot}`}></span>
                        {statusTheme.label}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => openStatusModal(report)}
                          className="p-1.5 text-black-icon hover:text-primary transition-colors"
                          title="View Details"
                          aria-label="View or update status"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 sm:p-5 border-t border-white-stroke flex items-center justify-between">
        <button 
          disabled={currentPage === 1}
          onClick={() => onFilterChange(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
          className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        
        <div className="flex items-center justify-center flex-1 gap-1 hidden sm:flex">
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            if (
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => onFilterChange(prev => ({ ...prev, page: page - 1 }))}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                    currentPage === page 
                      ? 'bg-[#127C2F] text-white shadow-sm' 
                      : 'text-paragraph hover:bg-white-bg hover:text-black'
                  }`}
                >
                  {page}
                </button>
              );
            }
            if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="text-paragraph px-1">...</span>;
            }
            return null;
          })}
        </div>

        <button 
          disabled={currentPage === totalPages}
          onClick={() => onFilterChange(prev => ({ ...prev, page: Math.min(totalPages - 1, prev.page + 1) }))}
          className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>

      {/* Status Update Modal */}
      {modalOpen && selectedReport && (() => {
        const currentStatusStr = (selectedReport.status || 'Reported').toLowerCase();
        const currentTheme = statusConfig[currentStatusStr] || statusConfig.reported;
        const catName = selectedReport.category ? selectedReport.category.replace(/_/g, ' ') : (selectedReport.title || 'Sanitation Issue');
        const refId = selectedReport.id ? selectedReport.id.substring(0, 8).toUpperCase() : 'N/A';
        const newStatusDisplay = newStatus === 'IN_PROGRESS' ? 'In Progress' : newStatus.charAt(0) + newStatus.slice(1).toLowerCase();

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
            <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 sm:p-8">
              
              <h2 className="text-[24px] sm:text-[28px] font-bold text-black mb-2 font-heading tracking-tight">
                Update Report Status
              </h2>
              
              <div className="text-sm sm:text-base text-paragraph mb-6">
                Report <span className="font-bold text-primary">#{refId}</span> <span className="capitalize">{catName.toLowerCase()}</span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm font-semibold text-black">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold border capitalize ${currentTheme.bg} ${currentTheme.text} ${currentTheme.bg.replace('bg-', 'border-').replace('Light', 'Stroke')}`}>
                  {currentTheme.label}
                </span>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="new-status-select" className="text-sm font-semibold text-black">New Status</label>
                  <select
                    id="new-status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-white-stroke rounded-xl text-sm font-medium text-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="REPORTED">Reported</option>
                    <option value="ACKNOWLEDGED">Acknowledged</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black">Add internal note or public update...</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="briefly describe the action being taken"
                    className="w-full px-4 py-3 bg-white border border-white-stroke rounded-xl text-sm font-medium text-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-y shadow-sm"
                    maxLength={500}
                  ></textarea>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={handleStatusUpdate}
                    disabled={isUpdating}
                    className="w-full py-3.5 bg-primary text-white rounded-xl text-sm sm:text-base font-semibold shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      'Submit Update'
                    )}
                  </button>
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="w-full py-3.5 bg-white border border-primary text-primary rounded-xl text-sm sm:text-base font-semibold hover:bg-primary/5 transition-colors active:scale-[0.99]"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <Info className="w-4 h-4 text-black-icon shrink-0 mt-0.5" />
                  <p className="text-xs text-paragraph leading-tight">
                    Setting the status to <span className="font-semibold text-primary">{newStatusDisplay}</span> will automatically notify the citizen reporter and credit their account with 50 impact points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Success Modal */}
      {showSuccessModal && selectedReport && (() => {
        const refId = selectedReport.id ? selectedReport.id.substring(0, 8).toUpperCase() : 'N/A';
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)}></div>
            <div className="bg-white w-full max-w-sm sm:max-w-md rounded-[24px] shadow-2xl relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-200 p-8 sm:p-10 text-center">
              
              <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
                {/* Simplified Confetti SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="28" fill="#127C2F"/>
                  <path d="M40 50L46 56L60 42" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Confetti particles */}
                  <path d="M25 25L28 20" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M75 25L72 20" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M85 50L90 48" stroke="#a855f7" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M80 80L84 84" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M20 75L15 78" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M10 50L15 48" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="30" cy="15" r="2" fill="#22c55e"/>
                  <circle cx="70" cy="85" r="2" fill="#3b82f6"/>
                  <circle cx="15" cy="35" r="2" fill="#a855f7"/>
                  <polygon points="85,30 88,35 82,35" fill="#f59e0b"/>
                  <polygon points="35,85 38,90 32,90" fill="#22c55e"/>
                </svg>
              </div>

              <h2 className="text-xl sm:text-[22px] font-bold text-black mb-3 font-heading tracking-tight">
                Report Status Updated
              </h2>
              
              <p className="text-sm sm:text-base text-paragraph mb-8 leading-relaxed">
                You have successfully updated report status with a Reference <span className="font-bold text-primary">#CR-{refId}</span>.
              </p>

              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3.5 bg-primary text-white rounded-xl text-sm sm:text-base font-bold shadow-sm hover:bg-primary/90 transition-colors active:scale-[0.99]"
                >
                  View all Reports
                </button>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3.5 bg-white border border-primary text-primary rounded-xl text-sm sm:text-base font-bold hover:bg-primary/5 transition-colors active:scale-[0.99]"
                >
                  Send a New Report
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
