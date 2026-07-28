import React, { useState, useEffect, useCallback } from 'react';
import { 
  AreaChart, Area, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import SEO from '../../components/SEO';
import { Download, FileText, CheckCircle2, Clock, BarChart2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminStatCard from '../../components/AdminStatCard';
import { calculateTrendFromReports, generateSparklinePath } from '../../utils/trendUtils';
import api from '../../services/api';

// --- PIE CHART DATA (Figma Mock) ---
const categoriesData = [
  { name: 'illegal Dumping', value: 40, color: '#34D399' },
  { name: 'Overflow Bin', value: 27, color: '#A7F3D0' },
  { name: 'Residential Dump', value: 9, color: '#93C5FD' },
  { name: 'Blocked Drains', value: 6, color: '#FDE047' },
  { name: 'Commercial Dump', value: 3, color: '#FCA5A5' },
  { name: 'Street Litter', value: 15, color: '#C4B5FD' },
];

// --- REPORT BY STATUS DATA (Figma Mock with Consistent App Colors) ---
const statusData = [
  { name: 'Resolved', value: 30, color: '#127C2F' }, // Green
  { name: 'In Progress', value: 20, color: '#9333EA' }, // Purple
  { name: 'Acknowledged', value: 10, color: '#3B82F6' }, // Blue
  { name: 'Reported', value: 40, color: '#F59E0B' }, // Orange
];

const contributorsData = [
  { name: 'Agatha', credits: 249 },
  { name: 'Mary', credits: 169 },
  { name: 'Ayo', credits: 324 },
  { name: 'Mercy', credits: 417 },
  { name: 'Amera', credits: 297 },
  { name: 'Nathan', credits: 123 },
  { name: 'Vivian', credits: 199 },
  { name: 'Beirah', credits: 89 },
];

const areasData = [
  { name: 'Odion', count: 60, color: '#93C5FD' },
  { name: 'Wharf', count: 65, color: '#FCA5A5' },
  { name: 'Island', count: 120, color: '#6EE7B7' },
  { name: 'Akwa', count: 50, color: '#FDE047' },
  { name: 'Abah', count: 40, color: '#C4B5FD' },
];

const timelineData = [
  { name: '0', val: 0.3 },
  { name: 'Sun', val: 0.28 },
  { name: 'Mon', val: 0.58 },
  { name: 'Tue', val: 0.42 },
  { name: 'Wed', val: 0.45 },
  { name: 'Thu', val: 0.82 },
  { name: 'Fri', val: 0.90 },
  { name: 'Sat', val: 0.98 },
];

const CustomPieLabel = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, color } = props;
  const radius = outerRadius * 1.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <g>
      <text x={x} y={y - 8} textAnchor={textAnchor} fill="#111827" fontSize={11} fontWeight={600} dominantBaseline="central">
        {name}
      </text>
      <text x={x} y={y + 8} textAnchor={textAnchor} fill="#127C2F" fontSize={10} fontWeight={700} dominantBaseline="central">
        {(percent * 100).toFixed(0)}%
      </text>
    </g>
  );
};

const CustomAreaTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    // Generate a mock timestamp based on current time
    const now = new Date();
    const mockTime = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    return (
      <div className="bg-white border border-white-stroke rounded-xl shadow-lg p-3 w-[150px]">
        <div className="text-[10px] text-paragraph mb-2 font-medium">{mockTime}</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#127C2F]"></div><span className="text-black-icon font-medium">Resolved</span></div>
            <span className="font-semibold text-black-icon">30%</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#9333EA]"></div><span className="text-black-icon font-medium">In Progress</span></div>
            <span className="font-semibold text-black-icon">20%</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#3B82F6]"></div><span className="text-black-icon font-medium">Acknowledged</span></div>
            <span className="font-semibold text-black-icon">10%</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#F59E0B]"></div><span className="text-black-icon font-medium">Pending</span></div>
            <span className="font-semibold text-black-icon">40%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('Weekly');
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, averageResponseTimeHours: 2.4 });
  const [reports, setReports] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const statsRes = await api.get('/reports/stats');
      if (statsRes.data?.data) {
        setStats({
          total: statsRes.data.data.totalReports || 0,
          resolved: statsRes.data.data.resolvedReports || 0,
          pending: (statsRes.data.data.totalReports || 0) - (statsRes.data.data.resolvedReports || 0), // Use remainder as pending
          averageResponseTimeHours: statsRes.data.data.averageResponseTimeHours || 2.4
        });
      }

      // Fetch a chunk of reports to calculate true trends
      const repRes = await api.get('/admin/reports?size=200');
      if (repRes.data?.data?.content) {
        setReports(repRes.data.data.content);
      }
    } catch (err) {
      console.error('Failed to fetch analytics stats', err);
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
  
  // Pending trend
  const pendingTrend = calculateTrendFromReports(reports, 'pending', stats.pending);
  pendingTrend.isPositive = false; // Force negative UI mapping for "Pending" as per design (red arrow down)
  
  const avgTimeTrend = calculateTrendFromReports(reports, 'responseTime', stats.averageResponseTimeHours);

  const totalPaths = generateSparklinePath(totalTrend.dataPoints);
  const resolvedPaths = generateSparklinePath(resolvedTrend.dataPoints);
  const pendingPaths = generateSparklinePath(pendingTrend.dataPoints);
  const avgTimePaths = generateSparklinePath(avgTimeTrend.dataPoints);

  return (
    <AdminLayout>
      <SEO title="Analytics | Admin" description="CleanReport Admin Analytics Dashboard" />
      
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-[28px] font-bold text-black mb-1">
              Analytics
            </h1>
            <p className="text-sm text-paragraph font-medium">
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
                iconColorClass="text-white" 
                iconBgClass="bg-[#8B5CF6]" 
              />
              <AdminStatCard 
                title="Resolved Reports" 
                value={stats.resolved} 
                trend={resolvedTrend} 
                paths={resolvedPaths} 
                icon={CheckCircle2} 
                iconColorClass="text-white" 
                iconBgClass="bg-[#127C2F]" 
              />
              <AdminStatCard 
                title="Pending Reports" 
                value={stats.pending} 
                trend={pendingTrend} 
                paths={pendingPaths} 
                icon={Clock} 
                iconColorClass="text-[#F59E0B]" 
                iconBgClass="bg-[#FFF4E5]" 
                svgFillColor="#FFE8E8" 
                svgStrokeColor="#DB0404" 
              />
              <AdminStatCard 
                title="Avg Response Time" 
                value={`${stats.averageResponseTimeHours}h`} 
                trend={avgTimeTrend} 
                paths={avgTimePaths} 
                icon={BarChart2} 
                iconColorClass="text-white" 
                iconBgClass="bg-[#006FED]" 
              />
            </div>

            {/* MIDDLE ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Categories of Reports */}
              <div className="bg-white border border-white-stroke rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="font-heading font-bold text-[17px] text-black">Categories of Reports</h2>
                    <p className="text-xs text-paragraph mt-1">Monthly staff growth and hiring patterns</p>
                  </div>
                  <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
                    {['Weekly', 'Monthly', 'Yearly'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setTimeFilter(filter)}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                          timeFilter === filter ? 'bg-white text-black shadow-sm' : 'text-paragraph hover:text-black'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 min-h-[250px] w-full flex items-center justify-center mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
                        label={<CustomPieLabel />}
                        stroke="none"
                      >
                        {categoriesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      {/* Optional extra standard tooltip just in case */}
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', padding: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Report By Status (Custom Horizontal Bars) */}
              <div className="bg-white border border-white-stroke rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                <div className="mb-6">
                   <h2 className="font-heading font-bold text-[17px] text-black">Report By Status</h2>
                   <p className="text-xs text-paragraph mt-1">Current lifecycle stage</p>
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-7">
                  {statusData.map((status, idx) => {
                    return (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-black">{status.name}</span>
                          <span className="text-sm text-paragraph">{status.value}%</span>
                        </div>
                        <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ width: `${status.value}%`, backgroundColor: status.color }}
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
              <div className="bg-white border border-white-stroke rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                <div className="mb-6">
                  <h2 className="font-heading font-bold text-[17px] text-black">Top Contributors by Credit Balance</h2>
                  <p className="text-xs text-paragraph mt-1">Ranked by CleanCredits balance</p>
                </div>
                <div className="flex-1 flex flex-col gap-4 justify-center py-2">
                  {contributorsData.map((c, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="w-12 text-xs font-medium text-black-icon text-right">{c.name}</span>
                      <div className="flex-1">
                        <div 
                          className="h-3 bg-[#127C2F]" 
                          style={{ width: `${(c.credits / Math.max(...contributorsData.map(d=>d.credits))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-xs text-paragraph">{c.credits}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 Reporting Areas */}
              <div className="bg-white border border-white-stroke rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                <div className="mb-2">
                  <h2 className="font-heading font-bold text-[17px] text-black">Top 5 Reporting Areas</h2>
                  <p className="text-xs text-paragraph mt-1">Araes where major reports come from</p>
                </div>
                <div className="flex-1 min-h-[220px] w-full flex flex-col">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={areasData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barSize={36}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="count" radius={[6, 6, 6, 6]}>
                          {areasData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white-stroke">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">Trend is up by 5.2% this month</span>
                      <TrendingUp className="w-4 h-4 text-black-icon" />
                    </div>
                    <p className="text-xs text-paragraph mt-1">Showing total visitors for the last 6 months</p>
                  </div>
                </div>
              </div>
            </div>

            {/* VERY BOTTOM: Reports Submitted Over Time */}
            <div className="bg-white border border-white-stroke rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-heading font-bold text-[17px] text-black">Reports Submitted Over Time</h2>
                  <p className="text-xs text-paragraph mt-1">Switch the time grain to explore trends</p>
                </div>
                <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
                  {['Weekly', 'Monthly', 'Yearly'].map(filter => (
                    <button
                      key={filter}
                      className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                        filter === 'Weekly' ? 'bg-white text-black shadow-sm' : 'text-paragraph hover:text-black'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 11 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 11 }} 
                      tickFormatter={(val) => val === 0 ? '02' : Math.floor(val * 16).toString().padStart(2, '0')}
                    />
                    <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Area 
                      type="linear" 
                      dataKey="val" 
                      stroke="#127C2F" 
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      fill="none" 
                      activeDot={{ r: 5, fill: '#127C2F', stroke: '#fff', strokeWidth: 2 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </>
        )}
      </div>
    </AdminLayout>
  );
}
