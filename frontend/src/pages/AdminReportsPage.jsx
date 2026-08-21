import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  FileEdit,
  MapPin
} from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import AdminReportsTable from '../components/AdminReportsTable';
import AdminStatCard from '../components/AdminStatCard';
const RegionalActivityMap = lazy(() => import('../components/RegionalActivityMap'));
import SEO from '../components/SEO';
import { generateTrendData, calculateTrendFromReports, generateSparklinePath } from '../utils/trendUtils';

export default function AdminReportsPage() {
  const location = useLocation();
  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/';
  const isReports = location.pathname === '/admin/reports' || location.pathname === '/admin/reports/';

  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('loading');
  const [stats, setStats] = useState({ total: 0, resolved: 0, acknowledged: 0, averageResponseTimeHours: 2.4 });
  const [pageData, setPageData] = useState({ totalElements: 0, totalPages: 1 });
  
  const [filters, setFilters] = useState({
    page: 0,
    size: 50,
    status: '',
    category: '',
    sortBy: 'createdAt',
    direction: 'desc'
  });

  const fetchAdminReports = useCallback(async () => {
    try {
      setStatus('loading');
      
      // Fetch stats for the top cards
      const [statsRes, dashRes] = await Promise.all([
        api.get('/reports/stats'),
        api.get('/analytics/dashboard')
      ]);
      
      let ackCount = 0;
      if (dashRes?.data?.data?.byStatus) {
        const ackObj = dashRes.data.data.byStatus.find(s => s.name === 'Acknowledged' || s.name === 'ACKNOWLEDGED');
        if (ackObj) ackCount = Number(ackObj.value || 0);
      }

      if (statsRes.data?.data) {
        setStats({
          total: statsRes.data.data.totalReports || 0,
          resolved: statsRes.data.data.resolvedReports || 0,
          acknowledged: ackCount,
          averageResponseTimeHours: statsRes.data.data.averageResponseTimeHours || 2.4
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
  const acknowledgedReports = stats.acknowledged;

  // Generate dynamic trends based on the current stats and available backend report data
  const totalTrend = calculateTrendFromReports(reports, 'total', totalReports);
  const resolvedTrend = calculateTrendFromReports(reports, 'resolved', resolvedReports);
  const acknowledgedTrend = calculateTrendFromReports(reports, 'acknowledged', acknowledgedReports);
  
  // For Avg Response Time, use the backend field once added (falls back to 2.4)
  const responseTimeTrend = calculateTrendFromReports(reports, 'responseTime', stats.averageResponseTimeHours); 
  
  const totalPaths = generateSparklinePath(totalTrend.dataPoints);
  const resolvedPaths = generateSparklinePath(resolvedTrend.dataPoints);
  const acknowledgedPaths = generateSparklinePath(acknowledgedTrend.dataPoints);
  const responseTimePaths = generateSparklinePath(responseTimeTrend.dataPoints);

  return (
    <AdminLayout>
      <SEO title={isDashboard ? "Admin Dashboard" : "Admin Reports"} description="Admin dashboard and reports management for CleanReport." />
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
          {status === 'error' && !isDashboard ? (
             // Render Skeleton Cards if error state on reports page
             [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[240px] md:w-auto shrink-0 snap-center animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white-stroke"></div>
                    <div className="w-4 h-4 bg-white-stroke rounded"></div>
                  </div>
                  <div className="w-2/3 h-8 bg-white-stroke rounded mb-2"></div>
                  <div className="w-1/2 h-10 bg-white-stroke rounded"></div>
                </div>
             ))
          ) : (
             <>
                <AdminStatCard 
                   title="Total Reports" 
                   value={status === 'loading' ? '...' : totalReports} 
                   trend={totalTrend} 
                   paths={totalPaths} 
                   icon={FileText} 
                   iconColorClass="text-[#127C2F]" 
                   iconBgClass="bg-[#006FED] text-white" 
                />
                <AdminStatCard 
                   title="Resolved Reports" 
                   value={status === 'loading' ? '...' : resolvedReports} 
                   trend={resolvedTrend} 
                   paths={resolvedPaths} 
                   icon={CheckCircle2} 
                   iconColorClass="text-[#DB0404]" 
                   iconBgClass="bg-primary text-white" 
                />
                <AdminStatCard 
                   title="Acknowledged Reports" 
                   value={status === 'loading' ? '...' : acknowledgedReports} 
                   trend={acknowledgedTrend} 
                   paths={acknowledgedPaths} 
                   icon={Clock} 
                   iconColorClass="text-[#F59E0B]" 
                   iconBgClass="bg-[#F59E0B] text-white" 
                />
                <AdminStatCard 
                   title="Avg Response Time" 
                   value={stats.averageResponseTimeHours + 'h'} 
                   trend={responseTimeTrend} 
                   paths={responseTimePaths} 
                   icon={Timer} 
                   iconColorClass="text-[#9CA3AF]" 
                   iconBgClass="bg-paragraph text-white" 
                />
             </>
          )}
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
            <div className="lg:col-span-7 flex flex-col h-full">
              {reports.length === 0 ? (
                <div className="bg-white border border-white-stroke rounded-2xl shadow-sm h-[450px] w-full flex flex-col items-center justify-center z-[300] px-4 text-center">
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
                <Suspense fallback={<div className="bg-white border border-white-stroke rounded-2xl shadow-sm h-[450px] w-full bg-white-bg animate-pulse"></div>}>
                  <RegionalActivityMap reports={reports} mapStatus={status} onRetry={fetchAdminReports} />
                </Suspense>
              )}
            </div>

            {/* Right Column: Recent Report */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-white border border-white-stroke rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-base sm:text-lg text-black">
                    Recent Report
                  </h2>
                  <Link to="/admin/reports" className="text-xs sm:text-sm font-semibold text-paragraph hover:underline">
                    view all
                  </Link>
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
                  <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                    <div className="flex flex-col">
                      {reports.slice(0, 5).map((report, idx) => {
                        const statusLower = (report.status || '').toLowerCase().replace(/[_ ]/g, '');
                        let bg, text, label;
                        if (statusLower === 'resolved') {
                           bg = 'bg-[#ECFDF3]'; text = 'text-[#10B981]'; label = 'Resolved';
                        } else if (statusLower === 'inprogress') {
                           bg = 'bg-[#F3E8FF]'; text = 'text-[#9333EA]'; label = 'In Progress';
                        } else {
                           bg = 'bg-[#FFF4E5]'; text = 'text-[#F59E0B]'; label = 'Reported';
                        }

                        return (
                          <Link 
                            key={report.id || report._id || idx} 
                            to={`/admin/reports/${report.id || report._id}`}
                            className="flex flex-col gap-2 py-3.5 border-b border-white-stroke last:border-0 hover:bg-white-bg transition-colors group"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${bg} ${text}`}>
                                {label}
                              </div>
                              <span className="text-[10px] text-paragraph font-medium whitespace-nowrap ml-2">
                                {new Date(report.createdAt || report.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                            <span className="font-extrabold text-black text-[13px] leading-tight group-hover:text-primary transition-colors capitalize">
                              {report.title || (report.category ? report.category.replace(/_/g, ' ').toLowerCase() : 'Sanitation Issue')}
                            </span>
                            <span className="text-[11px] text-paragraph truncate flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              {report.address || report.areaName || 'Location is currently being processed'}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
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
