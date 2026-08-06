import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, 
  PieChart, Pie, Cell, 
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import SEO from '../../components/SEO';
import { Download, FileText, CheckCircle2, Clock, Timer, TrendingUp, Lock, WifiOff, SearchX, FileWarning } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminStatCard from '../../components/AdminStatCard';
import StateCard from '../../components/StateCard';
import { calculateTrendFromReports, generateSparklinePath } from '../../utils/trendUtils';
import api from '../../services/api';

// --- PIE CHART DATA (Dynamic via API) ---
// --- REPORT BY STATUS DATA (Dynamic via API) ---
// --- AREAS DATA (Dynamic via API) ---
// --- TIMELINE DATA (Dynamic via API) ---

// contributorsData moved to state

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, x, y }) => {
  const textAnchor = x > cx ? 'start' : 'end';
  
  let displayName = name ? name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : '';
  if (displayName.toLowerCase() === 'illegal dumping') {
    displayName = 'illegal Dumping';
  }
  
  return (
    <text x={x} y={y} fill="#374151" textAnchor={textAnchor} dominantBaseline="central" className="text-[14px] font-semibold font-heading">
      <tspan x={x + (x > cx ? 6 : -6)} dy="-0.4em">{displayName}</tspan>
      <tspan x={x + (x > cx ? 6 : -6)} dy="1.4em" fill="#127C2F" className="text-[14px] font-normal">{value}%</tspan>
    </text>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const displayName = data.name === 'illegal Dumping' ? 'illegal Dump' : data.name;
    return (
      <div className="bg-white rounded-xl shadow-xl p-4 border border-white-stroke w-[220px]">
        <div className="text-[#1F2937] font-semibold mb-3">Percentage of Reports</div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: data.color }}></div>
            <span className="text-[#374151]">{displayName}</span>
          </div>
          <span className="font-medium text-[#374151]">{data.value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomAreaTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-white-stroke rounded-xl shadow-xl p-4 w-[170px]">
        <div className="text-[11px] text-[#6B7280] mb-3 font-medium">30-07-2028 28:20:45</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-[#127C2F]"></div><span className="text-[#4B5563] font-medium">Resolved</span></div>
            <span className="font-semibold text-[#4B5563]">30%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-[#8B5CF6]"></div><span className="text-[#4B5563] font-medium">In Progress</span></div>
            <span className="font-semibold text-[#4B5563]">20%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]"></div><span className="text-[#4B5563] font-medium">Acknowledged</span></div>
            <span className="font-semibold text-[#4B5563]">10%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]"></div><span className="text-[#4B5563] font-medium">Pending</span></div>
            <span className="font-semibold text-[#4B5563]">40%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, averageResponseTimeHours: 2.4 });
  const [reports, setReports] = useState([]);
  
  const [categoriesData, setCategoriesData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [areasData, setAreasData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [contributorsData, setContributorsData] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setErrorState(null);
      const [statsRes, repRes, dashRes, topContributorsRes] = await Promise.all([
        api.get('/reports/stats'),
        api.get('/admin/reports?size=200'),
        api.get('/analytics/dashboard').catch(() => null),
        api.get('/analytics/top-contributors?limit=10').catch(() => null)
      ]);

      let ackCount = 0;
      if (dashRes?.data?.data) {
        const d = dashRes.data.data;
        if (d.byStatus) {
          const ackObj = d.byStatus.find(s => s.name && s.name.toUpperCase().includes('ACKNOWLEDGE'));
          if (ackObj) ackCount = Number(ackObj.value || 0);
        }
      }

      if (statsRes.data?.data) {
        setStats({
          total: statsRes.data.data.totalReports || 0,
          resolved: statsRes.data.data.resolvedReports || 0,
          acknowledged: ackCount,
          averageResponseTimeHours: statsRes.data.data.averageResponseTimeHours || 2.4
        });
      }

      if (repRes.data?.data?.content) {
        setReports(repRes.data.data.content);
      }

      if (topContributorsRes?.data?.data || topContributorsRes?.data) {
        const top = topContributorsRes.data.data || topContributorsRes.data;
        if (Array.isArray(top)) {
          setContributorsData(top);
        }
      }

      if (dashRes?.data?.data) {
        const d = dashRes.data.data;

        if (d.resolutionByCategory) {
          const colors = ['#C4B5FD', '#FECACA', '#BFDBFE', '#A7F3D0', '#FEF08A', '#FED7AA'];
          setCategoriesData(d.resolutionByCategory
            .map((c, i) => ({
              name: c.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              value: Number(c.resolutionRate || 0),
              color: colors[i % colors.length]
            }))
            .filter(c => c.value > 0)
          );
        }

        if (d.byStatus) {
          const totalStatus = d.byStatus.reduce((acc, curr) => acc + Number(curr.value || 0), 0) || 1;
          setStatusData(d.byStatus.map(s => {
            const rawName = (s.name || '').toUpperCase();
            const displayName = (s.name || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            let color = '#6B7280';
            if (rawName.includes('RESOLV')) color = '#127C2F';
            else if (rawName.includes('PROGRESS')) color = '#9333EA';
            else if (rawName.includes('ACKNOWLEDGE')) color = '#3B82F6';
            else if (rawName.includes('REPORT')) color = '#F59E0B';

            return {
              name: displayName,
              value: Number(s.value || 0),
              percentage: Math.round((Number(s.value || 0) / totalStatus) * 100),
              color
            };
          }));
        }

        if (d.topAreas) {
          const areaColors = ['#93C5FD', '#FCA5A5', '#6EE7B7', '#FDE047', '#C4B5FD'];
          setAreasData(d.topAreas.map((a, i) => ({
            name: a.area,
            count: Number(a.count || 0),
            color: areaColors[i % areaColors.length]
          })));
        }

        if (d.trendsLast30Days && Array.isArray(d.trendsLast30Days) && d.trendsLast30Days.length > 0) {
          const recentDays = d.trendsLast30Days.slice(-8);
          setTimelineData(recentDays.map(t => {
            const dateObj = new Date(t.date);
            const dayName = isNaN(dateObj) ? t.date : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            return {
              name: dayName,
              solidVal: t.created || 0,
              dashedVal: t.resolved || 0
            };
          }));
        } else if (d.byDayOfWeek && Array.isArray(d.byDayOfWeek)) {
          setTimelineData(d.byDayOfWeek.map(t => ({
            name: t.label,
            solidVal: t.reports || 0,
            dashedVal: Math.floor((t.reports || 0) * 0.7)
          })));
        }
      }

    } catch (err) {
      console.error('Failed to fetch analytics stats', err);
      let errorType = '500';
      if (err.response) {
        if (err.response.status === 403) errorType = '403';
        else if (err.response.status === 404) errorType = '404';
      } else if (err.code === 'ECONNABORTED' || !navigator.onLine || err.message?.includes('Network')) {
        errorType = 'NETWORK';
      }
      
      if (errorType === '403') {
        setErrorState({
          icon: Lock,
          title: 'Permission denied',
          description: 'You do not have permission to access this dashboard section. Contact a Super Admin.',
          errorDetails: 'HTTP 403 · You do not have permission to access this resource.'
        });
      } else if (errorType === '404') {
        setErrorState({
          icon: SearchX,
          title: 'Not found',
          description: "We couldn't find the resource you were looking for.",
          errorDetails: 'HTTP 404 · The requested resource could not be found.'
        });
      } else if (errorType === 'NETWORK') {
        setErrorState({
          icon: WifiOff,
          title: 'Connection lost',
          description: 'You appear to be offline. Reconnect and try again.',
          errorDetails: 'NETWORK_TIMEOUT · Connection lost. Check your network and try again.'
        });
      } else {
        setErrorState({
          icon: FileWarning,
          title: 'Unable to load analytics',
          description: 'Something went wrong while loading analytics data.',
          errorDetails: 'HTTP 500 · Something went wrong while loading data.'
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleExport = () => {
    toast.success('Exporting analytics report...');
  };

  // Generate real dynamic trends based on backend data
  const totalTrend = calculateTrendFromReports(reports, 'total', stats.total);
  const resolvedTrend = calculateTrendFromReports(reports, 'resolved', stats.resolved);
  
  const ackTrend = calculateTrendFromReports(reports, 'acknowledged', stats.acknowledged);
  const pendingTrend = calculateTrendFromReports(reports, 'pending', stats.pending);
  pendingTrend.isPositive = false; // Force negative UI mapping for "Pending" as per design (red arrow down)
  
  const avgTimeTrend = calculateTrendFromReports(reports, 'responseTime', stats.averageResponseTimeHours);

  const totalPaths = generateSparklinePath(totalTrend.dataPoints);
  const resolvedPaths = generateSparklinePath(resolvedTrend.dataPoints);
  const ackPaths = generateSparklinePath(ackTrend.dataPoints);
  const pendingPaths = generateSparklinePath(pendingTrend.dataPoints);
  const avgTimePaths = generateSparklinePath(avgTimeTrend.dataPoints);

  return (
    <AdminLayout>
      <SEO title="Analytics | Admin" description="CleanReport Admin Analytics Dashboard" />
      
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-[28px] font-bold text-[#1F2937] mb-1">
              Analytics
            </h1>
            <p className="text-sm text-[#6B7280] font-medium">
              Live view of community reporting activity across all areas.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#127C2F] border border-[#127C2F] text-white font-semibold rounded-xl hover:bg-[#127C2F]/90 transition-colors shadow-sm self-start sm:self-auto text-sm"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>

        {loading ? (
          <div className="min-h-[500px] flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : errorState ? (
          <StateCard 
            icon={errorState.icon}
            title={errorState.title}
            description={errorState.description}
            errorDetails={errorState.errorDetails}
            onAction={fetchStats}
          />
        ) : (
          <>
            {/* TOP STATS GRID (Connected to Backend) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminStatCard 
                title="Total Reports" 
                value={stats.total} 
                trend={totalTrend} 
                paths={totalPaths} 
                icon={FileText} 
                iconBgClass="bg-[#006FED] text-white" 
              />
              <AdminStatCard 
                title="Resolved Reports" 
                value={stats.resolved} 
                trend={resolvedTrend} 
                paths={resolvedPaths} 
                icon={CheckCircle2} 
                iconBgClass="bg-primary text-white" 
              />
              <AdminStatCard 
                title="Acknowledged Reports" 
                value={stats.acknowledged} 
                trend={ackTrend} 
                paths={ackPaths} 
                icon={Clock} 
                iconBgClass="bg-[#F59E0B] text-white" 
              />
              <AdminStatCard 
                title="Avg Response Time" 
                value={`${stats.averageResponseTimeHours}h`} 
                trend={avgTimeTrend} 
                paths={avgTimePaths} 
                icon={Timer} 
                iconBgClass="bg-paragraph text-white" 
              />
            </div>

            {/* MIDDLE ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Categories of Reports */}
              <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between mb-4 gap-3">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-[#1F2937]">Categories of Reports</h2>
                    <p className="text-sm text-[#6B7280] mt-1">Breakdown of reports by issue category</p>
                  </div>
                  <div className="flex bg-white border border-[#E5E7EB] rounded-lg p-0.5">
                    {['Weekly', 'Monthly', 'Yearly'].map((filter, i) => (
                      <button
                        key={filter}
                        className={`px-4 py-1.5 text-[13px] rounded-md transition-colors ${
                          i === 0 ? 'bg-white text-[#127C2F] shadow-sm font-semibold' : 'text-[#4B5563] hover:text-black font-medium'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 min-h-[250px] w-full flex items-center justify-center mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 50, bottom: 20, left: 50 }}>
                      <Pie
                        data={categoriesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={75}
                        dataKey="value"
                        labelLine={{ stroke: '#D1D5DB', strokeWidth: 1.5, length1: 15, length2: 30 }}
                        label={<CustomPieLabel />}
                        stroke="#ffffff"
                        strokeWidth={2}
                        paddingAngle={3}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {categoriesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Report By Status (Custom Horizontal Bars) */}
              <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="mb-4">
                   <h2 className="font-heading font-bold text-xl text-[#1F2937]">Report By Status</h2>
                   <p className="text-sm text-[#6B7280] mt-1">Current lifecycle stage</p>
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-5 mt-2">
                  {statusData.map((status, idx) => {
                    return (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-[#1F2937]">{status.name}</span>
                          <span className="text-sm font-medium text-[#4B5563]">{status.percentage}% ({status.value})</span>
                        </div>
                        <div className="w-full bg-[#F3F4F6] rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full"
                            style={{ width: `${status.percentage}%`, backgroundColor: status.color }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Top Contributors */}
              <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px]">
                <div className="mb-6">
                  <h2 className="font-heading font-bold text-xl text-[#1F2937]">Top Contributors by Credit Balance</h2>
                  <p className="text-sm text-[#6B7280] mt-1">Ranked by CleanCredits balance</p>
                </div>
                <div className="flex-1 flex flex-col gap-4 justify-center py-2">
                  {contributorsData.map((c, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="w-12 text-[13px] font-medium text-[#4B5563] text-right">{c.name}</span>
                      <div className="flex-1">
                        <div 
                          className="h-3.5 bg-[#127C2F] rounded-r-sm" 
                          style={{ width: `${(c.credits / Math.max(...contributorsData.map(d=>d.credits))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-[13px] text-[#6B7280]">{c.credits}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 Reporting Areas */}
              <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px]">
                <div className="mb-4">
                  <h2 className="font-heading font-bold text-xl text-[#1F2937]">Top 5 Reporting Areas</h2>
                  <p className="text-sm text-[#6B7280] mt-1">Araes where major reports come from</p>
                </div>
                <div className="flex-1 min-h-[180px] w-full flex flex-col">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={areasData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barSize={42}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                        <Tooltip cursor={{ fill: '#F3F4F6', radius: 8 }} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                        <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                          {areasData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white-stroke">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1F2937]">High reporting density areas</span>
                      <TrendingUp className="w-4 h-4 text-[#4B5563]" />
                    </div>
                    <p className="text-[13px] text-[#6B7280] mt-1">Showing top locations based on total community reports submitted</p>
                  </div>
                </div>
              </div>
            </div>

            {/* VERY BOTTOM: Reports Submitted Over Time */}
            <div className="bg-white border border-white-stroke rounded-2xl p-4 sm:p-6 shadow-sm min-h-[400px]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 gap-4">
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#1F2937]">Reports Submitted Over Time</h2>
                  <p className="text-sm text-[#6B7280] mt-1">Switch the time grain to explore trends</p>
                </div>
                <div className="flex bg-white border border-[#E5E7EB] rounded-lg p-0.5">
                  {['Weekly', 'Monthly', 'Yearly'].map((filter, i) => (
                    <button
                      key={filter}
                      className={`px-4 py-1.5 text-[13px] rounded-md transition-colors ${
                        i === 0 ? 'bg-white text-[#127C2F] shadow-sm font-semibold' : 'text-[#4B5563] hover:text-black font-medium'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={{ stroke: '#E5E7EB' }} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }} 
                      tickFormatter={(val) => val === 0 ? '02' : Math.floor(val * 1.6).toString().padStart(2, '0')}
                      domain={[0, 10]}
                      ticks={[2, 4, 6, 8, 10, 12, 14, 16].map(v => v/1.6)}
                    />
                    <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />
                    <Line 
                      type="linear" 
                      dataKey="solidVal" 
                      stroke="#22C55E" 
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }} 
                      isAnimationActive={false}
                    />
                    <Line 
                      type="linear" 
                      dataKey="dashedVal" 
                      stroke="#22C55E" 
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      dot={false}
                      activeDot={{ r: 5, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }} 
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </>
        )}
      </div>
    </AdminLayout>
  );
}
