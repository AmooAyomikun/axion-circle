import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Check,
  MoreVertical, X, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import Footer from '../components/Footer';
import fallbackImage from '../assets/fallback-image.svg';

const ReportDetailMap = lazy(() => import('../components/ReportDetailMap'));

// Use a simplified generic timeline icon based on status
const getTimelineIcon = (status, isPast) => {
  const s = (status || '').toLowerCase();
  if (s === 'reported' && isPast) {
    return (
      <div className="w-6 h-6 rounded-full bg-[#127C2F] flex items-center justify-center shrink-0 z-10">
        <Check className="w-3.5 h-3.5 text-white" />
      </div>
    );
  }
  if (s === 'acknowledged' && isPast) {
    return (
      <div className="w-6 h-6 rounded-full bg-[#006FED] flex items-center justify-center shrink-0 z-10 border-4 border-blue-100">
        <div className="w-2 h-2 rounded-full bg-white"></div>
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-white border border-white-stroke flex items-center justify-center shrink-0 z-10">
      <div className="w-2 h-2 rounded-full bg-[#D1D5DB]"></div>
    </div>
  );
};

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [geoAddress, setGeoAddress] = useState(null);
  const [geoDistrict, setGeoDistrict] = useState(null);

  // Modal States
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [isApproveSuccessModalOpen, setIsApproveSuccessModalOpen] = useState(false);
  const [isUpdateSuccessModalOpen, setIsUpdateSuccessModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [internalNote, setInternalNote] = useState('');

  const handleApproveAction = () => {
    // Mock approve action
    setIsApproveSuccessModalOpen(true);
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    // Mock update status action
    setIsChangeStatusModalOpen(false);
    setIsUpdateSuccessModalOpen(true);
  };

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const [reportRes, statusRes] = await Promise.all([
          api.get(`/reports/${id}`),
          api.get(`/reports/${id}/status`).catch(() => ({ data: { data: [] } }))
        ]);

        setReport(reportRes.data?.data || reportRes.data);
        setStatusHistory(statusRes.data?.data || statusRes.data || []);
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error('Failed to load report details.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchReportData();
    }
  }, [id]);

  useEffect(() => {
    if (report && report.latitude && report.longitude && !geoAddress) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${report.latitude}&lon=${report.longitude}&zoom=16`, {
        headers: { "User-Agent": "CleanReport-AdminApp/1.0" }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const district = data.address.suburb || data.address.city_district || data.address.neighbourhood || data.address.city || 'District';
            setGeoDistrict(district);
            setGeoAddress(data.display_name);
          }
        }).catch(err => console.error(err));
    }
  }, [report, geoAddress]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-white-bg">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-paragraph text-sm font-medium">Loading details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (notFound || !report) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-white-bg p-6">
          <h2 className="text-2xl font-bold text-black mb-2">Report Not Found</h2>
          <p className="text-paragraph text-center mb-6">The report you are looking for does not exist or you do not have permission to view it.</p>
          <button 
            onClick={() => navigate('/admin/reports')}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Reports
          </button>
        </div>
      </AdminLayout>
    );
  }

  const categoryName = report.category ? report.category.replace(/_/g, ' ') : (report.title || 'Sanitation Issue');
  const imageUrl = report.photoUrl || report.imageUrl || (report.images && report.images[0]) || fallbackImage;

  // Build the timeline. We'll ensure there are 4 steps as in the design to match it exactly, or map actual history.
  // The design showed: Reported, Acknowledged, Resolved, Resolved. 
  // Let's create a dynamic list based on history, and pad it to match the general feel.
  let timeline = [
    { status: 'Reported', label: 'Reported', desc: 'Report has been delivered to the district', date: report.createdAt || report.date, active: true },
    { status: 'Acknowledged', label: 'Acknowledged', desc: 'A few details about your company', date: null, active: false },
    { status: 'Resolved', label: 'Resolved', desc: '', date: null, active: false },
    { status: 'Resolved', label: 'Resolved', desc: '', date: null, active: false },
  ];

  if (statusHistory && statusHistory.length > 0) {
    // We try to map the actual history into our visual timeline.
    timeline = statusHistory.map((sh, idx) => ({
      status: sh.status,
      label: (sh.status || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      desc: sh.remarks || (idx === 0 ? 'Report has been delivered to the district' : 'A few details about your company'),
      date: sh.createdAt,
      active: true
    }));
    
    // Add placeholders if it's less than 4 to match design aesthetic loosely
    while (timeline.length < 4) {
      timeline.push({ status: 'Resolved', label: 'Resolved', desc: '', date: null, active: false });
    }
  } else if (report.status) {
      // Just set current status active
      const currentIdx = timeline.findIndex(t => t.status.toLowerCase() === report.status.toLowerCase());
      if (currentIdx >= 0) {
          for(let i=0; i<=currentIdx; i++) {
              timeline[i].active = true;
          }
      }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  };

  const formatDateLabel = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' • ' + date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-full w-full max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-paragraph hover:text-black mb-4 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-[28px] font-bold text-black mb-1.5 font-heading">Report Details</h1>
          <p className="text-paragraph text-sm sm:text-base">Manually log a sanitation issue identified by field personnel.</p>
        </div>

        {/* Action Bar - Matches Figma */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 w-full mb-6 sm:mb-8">
          {/* Pills Row */}
          <div className="flex items-center justify-center lg:justify-start gap-4 lg:gap-6 w-full lg:w-auto">
            {/* Status Pill */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#FFF9E6] border border-[#FFD970] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
              <span className="text-[#F59E0B] font-bold text-xs">Pending Review</span>
            </div>
            {/* Divider */}
            <div className="w-[1px] h-8 bg-[#E5E7EB]"></div>
            {/* Urgency Pill */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-paragraph uppercase font-bold tracking-wider">Urgency Level</span>
                <span className="text-[#EF4444] font-bold text-sm">Critical</span>
              </div>
            </div>
          </div>

          {/* Buttons Row / Stack */}
          <div className="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={() => setIsChangeStatusModalOpen(true)}
              className="order-2 lg:order-1 w-full lg:w-auto px-8 py-2.5 bg-white border border-[#D1D5DB] text-black font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
              Change Status
            </button>
            <button 
              onClick={handleApproveAction}
              className="order-1 lg:order-2 w-full lg:w-auto px-8 py-2.5 bg-[#127C2F] text-white font-bold text-sm rounded-lg hover:bg-[#127C2F]/90 transition-colors shadow-sm whitespace-nowrap">
              Approve Action
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 sm:gap-8 items-start mb-10">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6 w-full">
              
              {/* Report Information (Image) */}
              <div className="bg-white border border-white-stroke rounded-2xl overflow-hidden shadow-xs">
                <div className="flex items-center justify-between px-5 py-4 bg-[#F8F9FA] border-b border-white-stroke">
                  <h3 className="font-bold text-black text-sm">Report Information</h3>
                  <button className="text-paragraph hover:text-black text-xs font-semibold">view all</button>
                </div>
                <div className="p-4 sm:p-5">
                  <img 
                    src={imageUrl} 
                    alt={categoryName} 
                    className="w-full h-[300px] sm:h-[400px] object-cover rounded-xl"
                  />
                </div>
              </div>

              {/* Report Information (Details) */}
              <div className="bg-white border border-white-stroke rounded-2xl overflow-hidden shadow-xs">
                <div className="flex items-center justify-between px-5 py-4 bg-[#F8F9FA] border-b border-white-stroke">
                  <h3 className="font-bold text-black text-sm">Report Information</h3>
                  <button className="text-paragraph hover:text-black text-xs font-semibold">view all</button>
                </div>
                <div className="p-5 sm:p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] text-paragraph uppercase font-medium mb-1 tracking-wider">Category</p>
                      <p className="font-bold text-black text-[15px]">{categoryName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-paragraph uppercase font-medium mb-1 tracking-wider">Date Reported</p>
                      <p className="font-semibold text-black text-[14px]">{formatDateLabel(report.createdAt || report.date)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-paragraph uppercase font-medium mb-1.5 tracking-wider">Description</p>
                    <p className="text-paragraph text-[15px] leading-relaxed">
                      {report.description || 'The green bin at Riverside East is completely full and littering the sidewalk. Several heavy bags have been left beside the bin, attracting pests and creating a walking hazard for pedestrians near the bus stop.'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-6 w-full">
              
              {/* Map Card */}
              <div className="bg-white border border-white-stroke rounded-2xl overflow-hidden shadow-xs h-[240px] relative z-0">
                <Suspense fallback={<div className="w-full h-full bg-white-bg2 flex items-center justify-center animate-pulse">Loading map...</div>}>
                  <ReportDetailMap report={report} geoDistrict={geoDistrict} geoAddress={geoAddress} />
                </Suspense>
              </div>

              {/* Assigned Inspector Card */}
              <div className="bg-white border border-white-stroke rounded-2xl overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 bg-[#F8F9FA] border-b border-white-stroke">
                  <h3 className="font-bold text-black text-sm">Assigned Inspector</h3>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#127C2F] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      NO
                    </div>
                    <div>
                      <p className="font-bold text-black text-sm">Natham Ayomikun</p>
                      <p className="text-paragraph text-xs font-medium">Admin</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full border border-white-stroke bg-white hover:bg-white-bg flex items-center justify-center text-paragraph transition-colors shadow-2xs">
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-white-stroke bg-white hover:bg-white-bg flex items-center justify-center text-paragraph transition-colors shadow-2xs">
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white border border-white-stroke rounded-2xl shadow-xs p-6">
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-3 top-2 bottom-6 w-[2px] bg-[#E5E7EB]"></div>
                  
                  <div className="flex flex-col gap-6">
                    {timeline.map((step, idx) => (
                      <div key={idx} className="flex gap-4 relative z-10">
                        {getTimelineIcon(step.status, step.active)}
                        <div className="-mt-0.5">
                          <h4 className={`font-bold text-sm mb-0.5 ${step.active ? 'text-[#127C2F]' : 'text-paragraph'}`}>
                            {step.label}
                          </h4>
                          {step.desc && (
                            <p className="text-paragraph text-xs mb-1">
                              {step.desc}
                            </p>
                          )}
                          {step.date && (
                            <p className="text-black-icon text-[11px] font-medium opacity-70">
                              {formatDateTime(step.date)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

          </div>
        </div>
        
        <div className="mt-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <Footer />
        </div>
      </div>

      {/* Change Status Modal */}
      {isChangeStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-[480px] w-full flex flex-col">
            <h2 className="text-xl font-bold text-black mb-1 font-heading">Update Report Status</h2>
            <p className="text-xs text-paragraph mb-6">
              Report <span className="text-[#127C2F] font-semibold">#{report?.id?.substring(0, 7).toUpperCase() || 'CR-8821'}</span> {categoryName}
            </p>
            
            <form onSubmit={handleSubmitUpdate} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">Current Status</label>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-alert-infoLight border border-alert-infoStroke rounded-full">
                  <span className="text-alert-info font-bold text-[10px]">Acknowledged</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">New Status</label>
                <div className="relative">
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm text-black focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="Reported">Reported</option>
                    <option value="Acknowledged">Acknowledged</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">Add internal note or public update...</label>
                <textarea 
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Briefly describe the action being taken"
                  className="w-full px-3 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm text-black focus:outline-none focus:border-primary min-h-[100px] resize-none"
                  required
                ></textarea>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button type="submit" className="w-full py-2.5 bg-[#127C2F] text-white rounded-lg font-bold text-sm hover:bg-[#127C2F]/90 transition-colors">
                  Submit Update
                </button>
                <button type="button" onClick={() => setIsChangeStatusModalOpen(false)} className="w-full py-2.5 bg-white border border-[#D1D5DB] text-black rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>

              <div className="flex items-start gap-2 mt-4 text-[10px] text-paragraph leading-tight">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
                <p>Setting the status to <span className="text-[#8B5CF6] font-medium">{newStatus}</span> will automatically notify the user that their issue is now under review and resolution is in progress.</p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Success Modal */}
      {isApproveSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-8 max-w-[400px] w-full flex flex-col items-center text-center">
            {/* Success Checkmark Icon */}
            <div className="w-[100px] h-[100px] mb-4 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#127C2F] rounded-full flex items-center justify-center z-10 m-3 shadow-md">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              {/* Confetti pieces */}
              <div className="absolute top-1 left-4 w-2 h-2 bg-[#F59E0B] rounded-sm transform rotate-12"></div>
              <div className="absolute top-2 right-6 w-2 h-2 bg-[#F59E0B] rounded-full"></div>
              <div className="absolute bottom-4 left-2 w-2 h-2 bg-[#F59E0B] rounded-full"></div>
              <div className="absolute bottom-2 right-4 w-2 h-2 bg-[#EF4444] rounded-sm transform -rotate-12"></div>
              <div className="absolute top-8 left-1 w-1.5 h-3 bg-[#F59E0B] rounded-full transform -rotate-45"></div>
              <div className="absolute top-10 right-1 w-1.5 h-3 bg-[#8B5CF6] rounded-full transform rotate-45"></div>
              <div className="absolute bottom-8 left-0 w-2 h-1.5 bg-[#8B5CF6] rounded-sm"></div>
              <div className="absolute bottom-6 right-1 w-2 h-1.5 bg-[#3B82F6] rounded-sm transform rotate-45"></div>
            </div>

            <h2 className="text-[24px] font-bold text-black font-heading mb-2">Report Approved</h2>
            <p className="text-paragraph text-sm mb-8 leading-relaxed">
              You have successfully approved a report with a<br />Reference <span className="text-[#127C2F] font-bold">#{report?.id?.substring(0, 7).toUpperCase() || 'CR-8822'}</span>.
            </p>
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => navigate('/admin/reports')} 
                className="w-full py-2.5 bg-[#127C2F] text-white rounded-lg font-bold text-sm hover:bg-[#127C2F]/90 transition-colors shadow-sm"
              >
                View all Reports
              </button>
              <button 
                onClick={() => setIsApproveSuccessModalOpen(false)} 
                className="w-full py-2.5 bg-white border border-[#D1D5DB] text-black rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Send a New Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Success Modal */}
      {isUpdateSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-8 max-w-[400px] w-full flex flex-col items-center text-center">
            {/* Success Checkmark Icon */}
            <div className="w-[100px] h-[100px] mb-4 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#127C2F] rounded-full flex items-center justify-center z-10 m-3 shadow-md">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              {/* Confetti pieces */}
              <div className="absolute top-1 left-4 w-2 h-2 bg-[#F59E0B] rounded-sm transform rotate-12"></div>
              <div className="absolute top-2 right-6 w-2 h-2 bg-[#F59E0B] rounded-full"></div>
              <div className="absolute bottom-4 left-2 w-2 h-2 bg-[#F59E0B] rounded-full"></div>
              <div className="absolute bottom-2 right-4 w-2 h-2 bg-[#EF4444] rounded-sm transform -rotate-12"></div>
              <div className="absolute top-8 left-1 w-1.5 h-3 bg-[#F59E0B] rounded-full transform -rotate-45"></div>
              <div className="absolute top-10 right-1 w-1.5 h-3 bg-[#8B5CF6] rounded-full transform rotate-45"></div>
              <div className="absolute bottom-8 left-0 w-2 h-1.5 bg-[#8B5CF6] rounded-sm"></div>
              <div className="absolute bottom-6 right-1 w-2 h-1.5 bg-[#3B82F6] rounded-sm transform rotate-45"></div>
            </div>

            <h2 className="text-[24px] font-bold text-black font-heading mb-2">Report Status Updated</h2>
            <p className="text-paragraph text-sm mb-8 leading-relaxed">
              You have successfully updated report status with a<br />Reference <span className="text-[#127C2F] font-bold">#{report?.id?.substring(0, 7).toUpperCase() || 'CR-8822'}</span>.
            </p>
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => navigate('/admin/reports')} 
                className="w-full py-2.5 bg-[#127C2F] text-white rounded-lg font-bold text-sm hover:bg-[#127C2F]/90 transition-colors shadow-sm"
              >
                View all Reports
              </button>
              <button 
                onClick={() => setIsUpdateSuccessModalOpen(false)} 
                className="w-full py-2.5 bg-white border border-[#D1D5DB] text-black rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Send a New Report
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
