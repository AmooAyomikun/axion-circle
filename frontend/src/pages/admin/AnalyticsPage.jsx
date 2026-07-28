import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import SEO from '../../components/SEO';
import { Download, FileText, CheckCircle2, Clock, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminStatCard from '../../components/AdminStatCard';
import { generateTrendData, generateSparklinePath } from '../../utils/trendUtils';

// --- MOCK DATA FOR FIGMA MATCHING ---
const categoriesData = [
  { name: 'Waste Dump', value: 45 },
  { name: 'Blocked Drainage', value: 25 },
  { name: 'Bush Clearing', value: 15 },
  { name: 'Dead Animals', value: 10 },
  { name: 'Others', value: 5 },
];
const CATEGORY_COLORS = ['#8B5CF6', '#F59E0B', '#127C2F', '#DB0404', '#006FED'];

const statusData = [
  { name: 'Resolved', value: 550, color: '#127C2F' },
  { name: 'In Progress', value: 200, color: '#F59E0B' },
  { name: 'Acknowledged', value: 100, color: '#006FED' },
  { name: 'Reported', value: 50, color: '#DB0404' },
];

const contributorsData = [
  { name: 'John Doe', credits: 34 },
  { name: 'Jane Smith', credits: 28 },
  { name: 'Mike Johnson', credits: 22 },
  { name: 'Sarah Williams', credits: 18 },
  { name: 'David Brown', credits: 15 },
];

const areasData = [
  { name: 'Ikeja', count: 120, color: '#006FED' },
  { name: 'Lekki', count: 85, color: '#8B5CF6' },
  { name: 'Yaba', count: 76, color: '#F59E0B' },
  { name: 'Surulere', count: 65, color: '#127C2F' },
  { name: 'Ajah', count: 50, color: '#DB0404' },
];

const timelineData = [
  { name: 'Jan', reports: 40 },
  { name: 'Feb', reports: 30 },
  { name: 'Mar', reports: 20 },
  { name: 'Apr', reports: 27 },
  { name: 'May', reports: 18 },
  { name: 'Jun', reports: 23 },
  { name: 'Jul', reports: 34 },
];

// Helper for generating custom outer labels for PieChart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <text x={x} y={y} fill="#6B7280" textAnchor={textAnchor} dominantBaseline="central" fontSize={11} fontWeight={500}>
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('Week');

  // Sparkline data for stat cards
  const [cardStats, setCardStats] = useState({
    total: null,
    resolved: null,
    pending: null,
    avgTime: null
  });

  useEffect(() => {
    // Generate realistic fake data for sparklines
    const totalData = generateTrendData('total_mock', 1245);
    const resolvedData = generateTrendData('resolved_mock', 890);
    const pendingData = generateTrendData('pending_mock', 355);
    pendingData.isPositive = false; // Force negative trend for Pending (red)
    const avgTimeData = generateTrendData('avgtime_mock', 24);
    
    setCardStats({
      total: { trend: totalData, paths: generateSparklinePath(totalData.dataPoints) },
      resolved: { trend: resolvedData, paths: generateSparklinePath(resolvedData.dataPoints) },
      pending: { trend: pendingData, paths: generateSparklinePath(pendingData.dataPoints) },
      avgTime: { trend: avgTimeData, paths: generateSparklinePath(avgTimeData.dataPoints) }
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleExport = () => {
    toast.success('Exporting analytics report...');
  };

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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-white-stroke text-black font-semibold rounded-xl hover:bg-white-bg transition-colors shadow-sm self-start sm:self-auto text-sm"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>

        {loading || !cardStats.total ? (
          <div className="min-h-[500px] flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* TOP STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminStatCard 
                title="Total Reports" 
                value="1,245" 
                trend={cardStats.total.trend} 
                paths={cardStats.total.paths} 
                icon={FileText} 
                iconColorClass="text-white" 
                iconBgClass="bg-[#8B5CF6]" 
              />
              <AdminStatCard 
                title="Resolved Reports" 
                value="890" 
                trend={cardStats.resolved.trend} 
                paths={cardStats.resolved.paths} 
                icon={CheckCircle2} 
                iconColorClass="text-white" 
                iconBgClass="bg-primary" 
              />
              <AdminStatCard 
                title="Pending Reports" 
                value="355" 
                trend={cardStats.pending.trend} 
                paths={cardStats.pending.paths} 
                icon={Clock} 
                iconColorClass="text-white" 
                iconBgClass="bg-[#F59E0B]" 
                svgFillColor="#FFE8E8" 
                svgStrokeColor="#DB0404" 
              />
              <AdminStatCard 
                title="Avg Response Time" 
                value="24h" 
                trend={cardStats.avgTime.trend} 
                paths={cardStats.avgTime.paths} 
                icon={BarChart2} 
                iconColorClass="text-white" 
                iconBgClass="bg-[#006FED]" 
              />
            </div>

            {/* MIDDLE ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Categories of Reports */}
              <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-bold text-[17px] text-black">Categories of Reports</h2>
                  <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
                    {['Week', 'Month', 'Year'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setTimeFilter(filter)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                          timeFilter === filter ? 'bg-white text-black shadow-sm' : 'text-paragraph hover:text-black'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 min-h-[300px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={true}
                        label={renderCustomizedLabel}
                      >
                        {categoriesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', padding: '8px 12px' }}
                        itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Report By Status (Custom Horizontal Bars) */}
              <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm flex flex-col">
                <h2 className="font-heading font-bold text-[17px] text-black mb-6">Report By Status</h2>
                
                <div className="flex-1 flex flex-col justify-center gap-6">
                  {statusData.map((status, idx) => {
                    // Calculate percentage relative to max value for width
                    const maxVal = Math.max(...statusData.map(d => d.value));
                    const percentage = (status.value / maxVal) * 100;
                    
                    return (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-black">{status.name}</span>
                          <span className="text-sm font-bold" style={{ color: status.color }}>{status.value.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-[#F3F4F6] rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full"
                            style={{ width: `${percentage}%`, backgroundColor: status.color }}
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
              
              {/* Top Contributors By Credit Balance */}
              <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading font-bold text-[17px] text-black mb-6">Top Contributors By Credit Balance</h2>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contributorsData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#111827', fontSize: 12, fontWeight: 500 }} width={90} />
                      <Tooltip 
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
                      />
                      <Bar dataKey="credits" fill="#127C2F" radius={[0, 4, 4, 0]} barSize={24} name="Credits" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top 5 Reporting Areas */}
              <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading font-bold text-[17px] text-black mb-6">Top 5 Reporting Areas</h2>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={areasData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <Tooltip 
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={35} name="Reports">
                        {areasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* VERY BOTTOM FULL-WIDTH: Reports Submitted Over Time */}
            <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm w-full">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                 <h2 className="font-heading font-bold text-[17px] text-black">Reports Submitted Over Time</h2>
                 <div className="flex bg-[#F3F4F6] p-1 rounded-lg self-start sm:self-auto">
                    {['Week', 'Month', 'Year'].map(filter => (
                      <button
                        key={`timeline-${filter}`}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                          filter === 'Year' ? 'bg-white text-black shadow-sm' : 'text-paragraph hover:text-black'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#127C2F" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#127C2F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="reports" stroke="#127C2F" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorReports)" name="Reports Submitted" />
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
