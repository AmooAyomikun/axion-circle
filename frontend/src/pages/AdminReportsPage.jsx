import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Timer,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  FileEdit
} from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import AdminReportsTable from '../components/AdminReportsTable';
const RegionalActivityMap = lazy(() => import('../components/RegionalActivityMap'));

export default function AdminReportsPage() {
  const location = useLocation();
  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/';
  const isReports = location.pathname === '/admin/reports' || location.pathname === '/admin/reports/';

  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('loading');
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [pageData, setPageData] = useState({ totalElements: 0, totalPages: 1 });
  
  const [filters, setFilters] = useState({
    page: 0,
    size: 5,
    status: '',
    category: '',
    sortBy: 'createdAt',
    direction: 'desc'
  });

  const fetchAdminReports = useCallback(async () => {
    try {
      setStatus('loading');
      
      // Fetch stats for the top cards
      const statsRes = await api.get('/reports/stats');
      if (statsRes.data?.data) {
        setStats({
          total: statsRes.data.data.totalReports || 0,
          resolved: statsRes.data.data.resolvedReports || 0,
          pending: statsRes.data.data.pendingReports || 0
        });
      }

      // Build query string
      const params = new URLSearchParams();
      params.append('page', filters.page);
      params.append('size', filters.size);
      params.append('sortBy', filters.sortBy);
      params.append('direction', filters.direction);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);

      // Fetch from admin endpoint
      const res = await api.get(`/admin/reports?${params.toString()}`);
      const pageInfo = res.data?.data || {};
      const content = pageInfo.content || [];
      const apiReports = Array.isArray(content) ? content : [];
      
      setPageData({
        totalElements: pageInfo.totalElements || 0,
        totalPages: pageInfo.totalPages || 1
      });
      
      // We will apply the same jitter as HomePage for the map
      const lagosLat = 6.5244;
      const lagosLng = 3.3792;
      const coordMap = new Map();
      const allReports = [...apiReports].map((r) => {
        let lat = r.latitude ? parseFloat(r.latitude) : lagosLat;
        let lng = r.longitude ? parseFloat(r.longitude) : lagosLng;
        
        const key = `${lat},${lng}`;
        const count = coordMap.get(key) || 0;
        coordMap.set(key, count + 1);

        let jitterLat = 0;
        let jitterLng = 0;
        if (count > 0) {
          jitterLat = Math.sin(count * 1234) * 0.0003;
          jitterLng = Math.cos(count * 1234) * 0.0003;
        }
        
        return {
          ...r,
          latitude: lat + jitterLat,
          longitude: lng + jitterLng,
          rawDate: r.createdAt ? new Date(r.createdAt).getTime() : (r.date ? 0 : Date.now())
        };
      });
      
      setReports(allReports);
      setStatus('success');
    } catch (err) {
      console.error('Failed to fetch admin reports', err);
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
        setStatus('forbidden');
      } else {
        setStatus('error');
      }
    }
  }, [filters]);

  useEffect(() => {
    fetchAdminReports();
  }, [fetchAdminReports]);

  const totalReports = stats.total;
  const resolvedReports = stats.resolved;
  const pendingReports = stats.pending;

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        
        {/* Header Section (Different title depending on route) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-lg sm:text-xl text-black mb-1.5">
              {isDashboard ? 'System Overview' : 'Dashboard Overview'}
            </h1>
            <p className="text-xs sm:text-sm text-paragraph font-medium">
              {isDashboard ? "Here's a summary of your agreements." : "Real time status of all community reports"}
            </p>
          </div>
          {status === 'error' && !isDashboard && (
            <button className="flex items-center gap-2 px-3 py-1.5 border border-[#FFE8E8] bg-[#FFE8E8] text-[#DB0404] rounded-lg text-xs font-bold hover:bg-[#FFE8E8]/80 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Connection Error
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-4 gap-4 pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* 1. Total Reports */}
          <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[240px] md:w-auto shrink-0 snap-center">
            {status === 'error' && !isDashboard ? (
              <div className="w-full h-full flex flex-col justify-between animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white-stroke"></div>
                  <div className="w-4 h-4 bg-white-stroke rounded"></div>
                </div>
                <div className="w-2/3 h-8 bg-white-stroke rounded mb-2"></div>
                <div className="w-1/2 h-10 bg-white-stroke rounded"></div>
              </div>
            ) : (
              <>
                <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                  <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                    <path d="M0,40 Q30,32 50,22 T90,10 T120,4 L120,48 L0,48 Z" fill="#E9FFEA" />
                    <path d="M0,40 Q30,32 50,22 T90,10 T120,4" fill="none" stroke="#127C2F" strokeWidth="1.5" strokeOpacity="0.4" />
                  </svg>
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#006FED] flex items-center justify-center text-white shadow-sm shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-black">Total Reports</span>
                  </div>
                  <button className="text-black-icon hover:text-black shrink-0" aria-label="More options">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-baseline gap-3 mt-auto relative z-10">
                  <span className="text-[28px] font-bold text-black tracking-tight leading-none">{status === 'loading' ? '...' : totalReports}</span>
                  <span className="inline-flex items-center gap-0.5 text-primary text-xs font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5" /> 40%
                  </span>
                </div>
              </>
            )}
          </div>

          {/* 2. Resolved Reports */}
          <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[240px] md:w-auto shrink-0 snap-center">
            {status === 'error' && !isDashboard ? (
              <div className="w-full h-full flex flex-col justify-between animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white-stroke"></div>
                  <div className="w-4 h-4 bg-white-stroke rounded"></div>
                </div>
                <div className="w-2/3 h-8 bg-white-stroke rounded mb-2"></div>
                <div className="w-1/2 h-10 bg-white-stroke rounded"></div>
              </div>
            ) : (
              <>
                <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                  <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                    <path d="M0,10 Q30,18 55,28 T90,36 T120,30 L120,48 L0,48 Z" fill="#FFE8E8" />
                    <path d="M0,10 Q30,18 55,28 T90,36 T120,30" fill="none" stroke="#DB0404" strokeWidth="1.5" strokeOpacity="0.4" />
                  </svg>
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-black">Resolved Reports</span>
                  </div>
                  <button className="text-black-icon hover:text-black shrink-0" aria-label="More options">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-baseline gap-3 mt-auto relative z-10">
                  <span className="text-[28px] font-bold text-black tracking-tight leading-none">{status === 'loading' ? '...' : resolvedReports}</span>
                  <span className="inline-flex items-center gap-0.5 text-alert-error text-xs font-bold">
                    <ArrowDownRight className="w-3.5 h-3.5" /> 10%
                  </span>
                </div>
              </>
            )}
          </div>

          {/* 3. Pending Reports */}
          <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[240px] md:w-auto shrink-0 snap-center">
            {status === 'error' && !isDashboard ? (
              <div className="w-full h-full flex flex-col justify-between animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white-stroke"></div>
                  <div className="w-4 h-4 bg-white-stroke rounded"></div>
                </div>
                <div className="w-2/3 h-8 bg-white-stroke rounded mb-2"></div>
                <div className="w-1/2 h-10 bg-white-stroke rounded"></div>
              </div>
            ) : (
              <>
                <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                  <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                    <path d="M0,20 Q30,15 50,30 T90,20 T120,10 L120,48 L0,48 Z" fill="#FFF4E5" />
                    <path d="M0,20 Q30,15 50,30 T90,20 T120,10" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.4" />
                  </svg>
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center text-white shadow-sm shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-black">Pending Reports</span>
                  </div>
                  <button className="text-black-icon hover:text-black shrink-0" aria-label="More options">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-baseline gap-3 mt-auto relative z-10">
                  <span className="text-[28px] font-bold text-black tracking-tight leading-none">{status === 'loading' ? '...' : pendingReports}</span>
                  <span className="inline-flex items-center gap-0.5 text-primary text-xs font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5" /> 5%
                  </span>
                </div>
              </>
            )}
          </div>

          {/* 4. Avg Response Time */}
          <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[240px] md:w-auto shrink-0 snap-center">
            {status === 'error' && !isDashboard ? (
              <div className="w-full h-full flex flex-col justify-between animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white-stroke"></div>
                  <div className="w-4 h-4 bg-white-stroke rounded"></div>
                </div>
                <div className="w-2/3 h-8 bg-white-stroke rounded mb-2"></div>
                <div className="w-1/2 h-10 bg-white-stroke rounded"></div>
              </div>
            ) : (
              <>
                <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                  <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                    <path d="M0,30 Q30,25 50,35 T90,20 T120,15 L120,48 L0,48 Z" fill="#F3F4F6" />
                    <path d="M0,30 Q30,25 50,35 T90,20 T120,15" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeOpacity="0.4" />
                  </svg>
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-paragraph flex items-center justify-center text-white shadow-sm shrink-0">
                      <Timer className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-black">Avg Response Time</span>
                  </div>
                  <button className="text-black-icon hover:text-black shrink-0" aria-label="More options">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-baseline gap-3 mt-auto relative z-10">
                  <span className="text-[28px] font-bold text-black tracking-tight leading-none">2.4h</span>
                  <span className="inline-flex items-center gap-0.5 text-primary text-xs font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5" /> 12%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* System Status Boxes for Error State on Reports Page */}
        {status === 'error' && !isDashboard && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 bg-[#FFE8E8] text-[#DB0404] flex items-center justify-center rounded-sm shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-black mb-0.5">System Status</p>
                <p className="text-xs text-paragraph">API Endpoint: 503 Service Unavailable</p>
              </div>
            </div>
            <div className="flex-1 w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 bg-[#E9FFEA] text-[#127C2F] flex items-center justify-center rounded-sm shrink-0 mt-0.5">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-black mb-0.5">Last Successful Sync</p>
                <p className="text-xs text-paragraph">Today at 04:12 AM</p>
              </div>
            </div>
          </div>
        )}

        {isDashboard ? (
          /* Map and Recent Reports Layout for Dashboard Route */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Left Column: Regional Activity Map */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white border border-white-stroke rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
                {reports.length === 0 ? (
                  <div className="h-[450px] w-full flex flex-col items-center justify-center bg-white z-[300] px-4 text-center">
                    <div className="w-16 h-16 bg-white border border-white-stroke rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <FileEdit className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-black mb-2">No Report on Map</h3>
                    <p className="text-xs sm:text-sm text-paragraph max-w-sm mb-8 leading-relaxed">
                      There is no map details showing regional activity reporting
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4">
                      <button 
                        className="w-full sm:w-auto bg-primary text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm hover:bg-primary/90 transition-colors"
                      >
                        Manually Create a Report
                      </button>
                      <button 
                        className="w-full sm:w-auto bg-white border border-[#22c55e] text-black font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl hover:bg-white-bg transition-colors"
                      >
                        View Documentation
                      </button>
                    </div>
                  </div>
                ) : (
                  <Suspense fallback={<div className="h-[450px] w-full bg-white-bg animate-pulse"></div>}>
                    <RegionalActivityMap reports={reports} mapStatus={status} onRetry={fetchAdminReports} />
                  </Suspense>
                )}
              </div>
            </div>

            {/* Right Column: Recent Report */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-white border border-white-stroke rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-[450px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-base sm:text-lg text-black">
                    Recent Report
                  </h2>
                  <button className="text-xs sm:text-sm font-semibold text-paragraph hover:underline">
                    view all
                  </button>
                </div>
                {reports.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
                    <div className="w-16 h-16 bg-white border border-white-stroke rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <FileEdit className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-black mb-3">No Recent Report Yet</h3>
                    <p className="text-xs sm:text-sm text-paragraph max-w-[280px] mx-auto leading-relaxed mb-6">
                      When citizens submit sanitation issues through the mobile app, they will appear here in real-time for review and assignment.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    {/* Render recent reports list here if reports exist */}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* The Main Table (Shown only on Reports Page) */
          <div className="pb-8">
            <AdminReportsTable 
              reports={reports} 
              pageData={pageData}
              filters={filters}
              onFilterChange={setFilters}
              onRefresh={fetchAdminReports} 
              hasError={status === 'error'}
            />
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
