import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import SEO from '../../components/SEO';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

// --- MOCK DATA ---
const trendsData = [
  { date: 'Oct 01', created: 12, resolved: 8 },
  { date: 'Oct 05', created: 18, resolved: 10 },
  { date: 'Oct 10', created: 25, resolved: 22 },
  { date: 'Oct 15', created: 15, resolved: 18 },
  { date: 'Oct 20', created: 30, resolved: 25 },
  { date: 'Oct 25', created: 22, resolved: 28 },
  { date: 'Oct 30', created: 10, resolved: 15 },
];

const pieData = [
  { name: 'Resolved', value: 45 },
  { name: 'Pending', value: 30 },
  { name: 'In Progress', value: 15 },
  { name: 'Acknowledged', value: 10 },
];
const COLORS = ['#127C2F', '#F59E0B', '#006FED', '#8B5CF6'];

const volumeData = [
  { label: 'Mon', reports: 24 },
  { label: 'Tue', reports: 18 },
  { label: 'Wed', reports: 35 },
  { label: 'Thu', reports: 22 },
  { label: 'Fri', reports: 40 },
  { label: 'Sat', reports: 15 },
  { label: 'Sun', reports: 10 },
];

const areasData = [
  { area: 'Ikeja', count: 120 },
  { area: 'Lekki', count: 85 },
  { area: 'Yaba', count: 76 },
  { area: 'Surulere', count: 65 },
  { area: 'Ajah', count: 50 },
];

const goalsData = [
  { category: 'Waste Dump', resolutionRate: 85 },
  { category: 'Drainage', resolutionRate: 60 },
  { category: 'Street Sweeping', resolutionRate: 92 },
  { category: 'Illegal Dumping', resolutionRate: 45 },
];
// -----------------

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  // Simulate fetching data
  useEffect(() => {
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
      
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-black mb-1">
              Analytics Overview
            </h1>
            <p className="text-sm text-paragraph font-medium">
              Comprehensive data insights and report metrics
            </p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-white-stroke text-black font-semibold rounded-xl hover:bg-white-bg transition-colors shadow-sm self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-primary" />
            Download Report
          </button>
        </div>

        {loading ? (
          <div className="min-h-[500px] flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* 1. Line/Area Chart (Spans 2 columns on extra large screens) */}
            <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm xl:col-span-2">
              <h2 className="font-heading font-bold text-lg text-black mb-1">Report Trends</h2>
              <p className="text-xs text-paragraph mb-6">Volume of reports created vs. resolved over time</p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006FED" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#006FED" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#127C2F" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#127C2F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="created" stroke="#006FED" strokeWidth={3} fillOpacity={1} fill="url(#colorCreated)" name="Created Reports" />
                    <Area type="monotone" dataKey="resolved" stroke="#127C2F" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" name="Resolved Reports" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Pie Chart */}
            <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm flex flex-col">
              <h2 className="font-heading font-bold text-lg text-black mb-1">Status Distribution</h2>
              <p className="text-xs text-paragraph mb-2">Breakdown of current report statuses</p>
              <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', padding: '8px 12px' }}
                      itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-sm font-medium text-black">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Vertical Bar Chart (Volume) */}
            <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading font-bold text-lg text-black mb-1">Weekly Volume</h2>
              <p className="text-xs text-paragraph mb-6">Reports submitted per day of the week</p>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
                    />
                    <Bar dataKey="reports" fill="#127C2F" radius={[4, 4, 0, 0]} barSize={30} name="Reports" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Horizontal Bar Chart (Rankings) */}
            <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading font-bold text-lg text-black mb-1">Top Areas</h2>
              <p className="text-xs text-paragraph mb-6">Regions with the highest report counts</p>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={areasData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis dataKey="area" type="category" axisLine={false} tickLine={false} tick={{ fill: '#111827', fontSize: 12, fontWeight: 500 }} width={70} />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
                    />
                    <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} name="Reports" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 5. Progress Bars (Goals/Resolution Rates) */}
            <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading font-bold text-lg text-black mb-1">Resolution Goals</h2>
              <p className="text-xs text-paragraph mb-6">Target resolution rates by category</p>
              
              <div className="flex flex-col gap-5">
                {goalsData.map((goal, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-black">{goal.category}</span>
                      <span className="text-sm font-bold text-primary">{goal.resolutionRate}%</span>
                    </div>
                    <div className="w-full bg-white-bg2 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${
                          goal.resolutionRate >= 80 ? 'bg-primary' : 
                          goal.resolutionRate >= 50 ? 'bg-[#F59E0B]' : 'bg-[#DB0404]'
                        }`}
                        style={{ width: `${goal.resolutionRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}
