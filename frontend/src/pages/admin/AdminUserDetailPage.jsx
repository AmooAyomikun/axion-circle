import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Mail, Phone, MapPin, Search, Settings, Bell, ChevronDown, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import SEO from '../../components/SEO';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile Details');

  // Tabs Definition
  const tabs = ['Profile Details', 'Reports', 'Rewards', 'Activity'];

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setHasError(false);
      const res = await api.get(`/admin/users/${id}`);
      setUser(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleToggleStatus = async () => {
    if (!user) return;
    const isSuspending = !user.suspended;
    
    try {
      await api.patch(`/admin/users/${user.id}/suspend`, { suspended: isSuspending });
      toast.success(`User ${isSuspending ? 'suspended' : 'activated'} successfully`);
      fetchUser();
    } catch (err) {
      console.error(`Failed to update status`, err);
      toast.error(`Failed to update user status. Please try again.`);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  if (hasError || !user) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-12 h-12 text-[#DB0404] mb-4" />
          <h2 className="text-xl font-bold mb-2">User not found</h2>
          <button onClick={() => navigate('/admin/users')} className="text-primary hover:underline">
            Back to Users List
          </button>
        </div>
      </AdminLayout>
    );
  }

  const isSuspended = user.suspended;
  const displayName = user.displayName || user.firstName || 'User';

  return (
    <AdminLayout>
      <SEO title={`${displayName} | Admin`} description="User Profile Details" />

      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-10">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/admin" className="text-black font-semibold hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-paragraph" />
          <Link to="/admin/users" className="text-black font-semibold hover:text-primary transition-colors">User Profile</Link>
          <ChevronRight className="w-4 h-4 text-paragraph" />
          <span className="text-primary font-semibold">{activeTab}</span>
        </div>
        <p className="text-sm text-paragraph mt(-2)">Profile of a Cleanreport user</p>

        {/* User Header Card */}
        <div className="bg-white border border-white-stroke rounded-2xl p-6 flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`} 
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
              />
              <div className="absolute bottom-0 right-0 bg-[#127C2F] text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-black">{user.firstName} {user.lastName || ''}</h1>
                {isSuspended && (
                  <span className="px-2.5 py-0.5 bg-[#FEE2E2] text-[#EF4444] text-[11px] font-bold rounded-full flex items-center gap-1.5 border border-[#EF4444]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                    Suspended
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-paragraph">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 opacity-70" />
                  <span>{user.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 opacity-70" />
                  <span>{user.phone || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-paragraph">
                <MapPin className="w-4 h-4 opacity-70" />
                <span>{user.address || 'Address not available'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              className={`px-6 py-2.5 rounded-lg text-sm font-bold border transition-colors w-full sm:w-auto
                ${isSuspended ? 'border-white-stroke text-black hover:bg-white-bg' : 'border-[#EF4444] text-[#EF4444] hover:bg-[#FEE2E2]'}
              `}
              onClick={handleToggleStatus}
            >
              {isSuspended ? 'Delete User' : 'Deactivate User'}
            </button>
            <button 
              className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-colors w-full sm:w-auto
                ${!isSuspended ? 'bg-[#127C2F] opacity-50 cursor-not-allowed' : 'bg-[#127C2F] hover:bg-[#127C2F]/90 shadow-sm'}
              `}
              onClick={isSuspended ? handleToggleStatus : undefined}
              disabled={!isSuspended}
            >
              Reactivate User
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard title="Reports submitted" value={user.totalReports || 4} />
          <StatCard title="Resolved reports" value={2} /> {/* Mocked */}
          <StatCard title="Credit balance" value={user.creditBalance || 120} />
          <StatCard title="Credits redeemed" value={318} /> {/* Mocked */}
        </div>

        {/* Tabs navigation */}
        <div className="flex bg-white rounded-xl border border-white-stroke p-1.5 w-max">
          {tabs.map((tab) => {
            const isReportsTab = tab === 'Reports';
            const displayLabel = isReportsTab ? `Reports (${user.totalReports || 4})` : tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-white text-black shadow-sm'
                    : 'text-paragraph hover:text-black hover:bg-white-bg/50'
                }`}
              >
                {displayLabel}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-2">
          {activeTab === 'Profile Details' && <ProfileDetailsTab user={user} />}
          {activeTab === 'Reports' && <ReportsTab />}
          {activeTab === 'Rewards' && <RewardsTab />}
          {activeTab === 'Activity' && <ActivityTab />}
        </div>
      </div>
    </AdminLayout>
  );
}

// Subcomponents

const StatCard = ({ title, value }) => (
  <div className="bg-white border border-white-stroke rounded-2xl p-5 flex flex-col gap-2">
    <h3 className="text-sm font-bold text-paragraph">{title}</h3>
    <p className="text-3xl font-heading font-bold text-black">{value.toLocaleString()}</p>
  </div>
);

const ProfileDetailsTab = ({ user }) => (
  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-x-8 gap-y-6">
    <div className="text-sm font-bold text-black mt-3 hidden md:block">First Name</div>
    <div>
      <div className="md:hidden text-sm font-bold text-black mb-2">First Name</div>
      <input type="text" readOnly value={user.firstName || ''} className="w-full sm:w-[500px] px-4 py-3 bg-white border border-white-stroke rounded-xl text-black text-sm outline-none" />
    </div>

    <div className="text-sm font-bold text-black mt-3 hidden md:block">Middle Name</div>
    <div>
      <div className="md:hidden text-sm font-bold text-black mb-2">Middle Name</div>
      <input type="text" readOnly value={""} className="w-full sm:w-[500px] px-4 py-3 bg-white border border-white-stroke rounded-xl text-black text-sm outline-none" />
    </div>

    <div className="text-sm font-bold text-black mt-3 hidden md:block">Last Name</div>
    <div>
      <div className="md:hidden text-sm font-bold text-black mb-2">Last Name</div>
      <input type="text" readOnly value={user.lastName || ''} className="w-full sm:w-[500px] px-4 py-3 bg-white border border-white-stroke rounded-xl text-black text-sm outline-none" />
    </div>

    <div className="text-sm font-bold text-black mt-3 hidden md:block">Phone Number</div>
    <div>
      <div className="md:hidden text-sm font-bold text-black mb-2">Phone Number</div>
      <div className="relative w-full sm:w-[500px]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-paragraph font-bold">
          <span className="text-lg">🇺🇸</span>
        </div>
        <input type="text" readOnly value={user.phone || '+1 908 765 4321'} className="w-full pl-12 pr-4 py-3 bg-white border border-white-stroke rounded-xl text-black text-sm outline-none" />
      </div>
    </div>

    <div className="text-sm font-bold text-black mt-3 hidden md:block">Gender</div>
    <div>
      <div className="md:hidden text-sm font-bold text-black mb-2">Gender</div>
      <div className="relative w-full sm:w-[500px]">
        <select disabled value={user.gender || 'Female'} className="w-full px-4 py-3 bg-white border border-white-stroke rounded-xl text-black text-sm outline-none appearance-none disabled:opacity-100">
          <option>Female</option>
          <option>Male</option>
          <option>Other</option>
        </select>
        <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-paragraph" />
      </div>
    </div>

    <div className="text-sm font-bold text-black mt-3 hidden md:block">Email Address</div>
    <div>
      <div className="md:hidden text-sm font-bold text-black mb-2">Email Address</div>
      <div className="relative w-full sm:w-[500px]">
        <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-black-icon" />
        <input type="text" readOnly value={user.email || ''} className="w-full pl-10 pr-4 py-3 bg-white border border-white-stroke rounded-xl text-black text-sm outline-none" />
      </div>
    </div>

    <div className="text-sm font-bold text-black mt-3 hidden md:block">Home Address</div>
    <div>
      <div className="md:hidden text-sm font-bold text-black mb-2">Home Address</div>
      <textarea readOnly value={user.address || 'No 7 Clean Road, off Refinary Junction, Lagos State'} className="w-full sm:w-[500px] h-[100px] px-4 py-3 bg-white border border-white-stroke rounded-xl text-black text-sm outline-none resize-none" />
      <div className="text-[12px] text-paragraph mt-2">400 characters left</div>
    </div>
  </div>
);

const ReportsTab = () => {
  const mockReports = [
    { id: 'CR-10208', category: 'Blocked Drain', location: '15 Greenway Drive, Lekki, Lagos', date: '2026-02-23', status: 'In Progress', statusColor: 'text-[#9333EA]', dotColor: 'bg-[#9333EA]' },
    { id: 'CR-10209', category: 'Illegal Dumping', location: '22 Maple Street, Victoria Island, Lagos', date: '2026-02-24', status: 'Pending', statusColor: 'text-[#F59E0B]', dotColor: 'bg-[#F59E0B]' },
    { id: 'CR-10210', category: 'Overflowing Bin', location: '30 Ocean Breeze, Ikoyi, Lagos', date: '2026-02-25', status: 'Approved', statusColor: 'text-[#127C2F]', dotColor: 'bg-[#127C2F]' },
    { id: 'CR-10211', category: 'Blocked Drain', location: '45 Sunset Boulevard, Surulere, Lagos', date: '2026-02-26', status: 'Approved', statusColor: 'text-[#127C2F]', dotColor: 'bg-[#127C2F]' },
    { id: 'CR-10212', category: 'Commercial Waste', location: '78 Riverside Road, Yaba, Lagos', date: '2026-02-27', status: 'Acknowledged', statusColor: 'text-[#3B82F6]', dotColor: 'bg-[#3B82F6]' },
    { id: 'CR-10213', category: 'Street Litter', location: '101 Hillside Crescent, Apapa, Lagos', date: '2026-02-28', status: 'Rejected', statusColor: 'text-[#EF4444]', dotColor: 'bg-[#EF4444]' },
  ];

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 flex items-center justify-between border-b border-white-stroke">
        <h3 className="font-heading font-bold text-lg">Reports Submitted</h3>
        <Link to="/admin/reports" className="text-primary font-semibold text-sm hover:underline">View in Report</Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white border-b border-white-stroke text-xs font-semibold text-paragraph h-[44px]">
              <th className="px-5 py-3 whitespace-nowrap">Reports ID</th>
              <th className="px-5 py-3 whitespace-nowrap">Category</th>
              <th className="px-5 py-3 whitespace-nowrap">Location</th>
              <th className="px-5 py-3 whitespace-nowrap">Date</th>
              <th className="px-5 py-3 whitespace-nowrap flex items-center gap-1">Status <ChevronDown className="w-3 h-3 opacity-50" /></th>
              <th className="px-5 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white-stroke text-sm">
            {mockReports.map((report) => (
              <tr key={report.id} className="hover:bg-white-bg/50 transition-colors h-[64px]">
                <td className="px-5 py-3 font-bold text-black">{report.id}</td>
                <td className="px-5 py-3 text-paragraph">{report.category}</td>
                <td className="px-5 py-3 text-paragraph">{report.location}</td>
                <td className="px-5 py-3 text-paragraph">{report.date}</td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${report.dotColor}`}></span>
                    <span className={`text-[12px] font-bold ${report.statusColor}`}>{report.status}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-center">
                  <Link to={`/admin/reports/${report.id}`} className="p-1.5 text-black-icon hover:text-primary transition-colors focus:outline-none inline-block">
                    <Eye className="w-4 h-4 opacity-70 hover:opacity-100" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 border-t border-white-stroke flex items-center justify-between">
        <button className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg transition-colors bg-white">
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <div className="flex items-center gap-1 hidden sm:flex">
          <button className="w-8 h-8 rounded-lg bg-[#127C2F] text-white text-sm font-bold flex items-center justify-center">1</button>
          <button className="w-8 h-8 rounded-lg text-paragraph hover:text-black hover:bg-white-bg text-sm font-bold flex items-center justify-center">2</button>
          <button className="w-8 h-8 rounded-lg text-paragraph hover:text-black hover:bg-white-bg text-sm font-bold flex items-center justify-center">3</button>
          <span className="px-2 text-paragraph text-sm font-bold">...</span>
          <button className="w-8 h-8 rounded-lg text-paragraph hover:text-black hover:bg-white-bg text-sm font-bold flex items-center justify-center">8</button>
          <button className="w-8 h-8 rounded-lg text-paragraph hover:text-black hover:bg-white-bg text-sm font-bold flex items-center justify-center">9</button>
          <button className="w-8 h-8 rounded-lg text-paragraph hover:text-black hover:bg-white-bg text-sm font-bold flex items-center justify-center">10</button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg transition-colors bg-white">
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const RewardsTab = () => {
  const mockRewards = [
    { id: 1, name: '₦3,500 Restaurant Gift Card', store: 'FreshMart Yaba', credits: 400, date: '2026-02-23', status: 'Approved', statusColor: 'text-[#127C2F]', dotColor: 'bg-[#127C2F]' },
    { id: 2, name: '₦1,200 Movie Ticket', store: 'SwiftTel Ikeja', credits: 500, date: '2026-02-24', status: 'Rejected', statusColor: 'text-[#EF4444]', dotColor: 'bg-[#EF4444]' },
    { id: 3, name: '₦5,000 Online Shopping Credit', store: 'GroceryHub Victoria', credits: 800, date: '2026-02-25', status: 'Approved', statusColor: 'text-[#127C2F]', dotColor: 'bg-[#127C2F]' },
    { id: 4, name: 'Airtime Top-up', store: 'EcoStore Lagos', credits: 10000, date: '2026-02-26', status: 'Approved', statusColor: 'text-[#127C2F]', dotColor: 'bg-[#127C2F]' },
    { id: 5, name: '₦2,500 Fitness Class Pass', store: 'MarketPlace Central', credits: 450, date: '2026-02-27', status: 'Approved', statusColor: 'text-[#127C2F]', dotColor: 'bg-[#127C2F]' },
    { id: 6, name: '₦1,800 Bookstore Coupon', store: 'UrbanGrocer Ikeja', credits: 1029, date: '2026-02-28', status: 'Rejected', statusColor: 'text-[#EF4444]', dotColor: 'bg-[#EF4444]' },
  ];

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 flex items-center justify-between border-b border-white-stroke">
        <h3 className="font-heading font-bold text-lg">Reward History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white border-b border-white-stroke text-xs font-semibold text-paragraph h-[44px]">
              <th className="px-5 py-3 w-12">
                <input type="checkbox" className="w-4 h-4 rounded border-white-stroke text-primary" />
              </th>
              <th className="px-5 py-3 whitespace-nowrap">Rewards</th>
              <th className="px-5 py-3 whitespace-nowrap">Store</th>
              <th className="px-5 py-3 whitespace-nowrap">Credits</th>
              <th className="px-5 py-3 whitespace-nowrap">Date</th>
              <th className="px-5 py-3 whitespace-nowrap flex items-center gap-1">Status <ChevronDown className="w-3 h-3 opacity-50" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white-stroke text-sm">
            {mockRewards.map((reward) => (
              <tr key={reward.id} className="hover:bg-white-bg/50 transition-colors h-[64px]">
                <td className="px-5 py-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-white-stroke text-primary" />
                </td>
                <td className="px-5 py-3 font-bold text-black">{reward.name}</td>
                <td className="px-5 py-3 text-paragraph">{reward.store}</td>
                <td className="px-5 py-3 text-paragraph">{reward.credits.toLocaleString()}</td>
                <td className="px-5 py-3 text-paragraph">{reward.date}</td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${reward.dotColor}`}></span>
                    <span className={`text-[12px] font-bold ${reward.statusColor}`}>{reward.status}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 border-t border-white-stroke flex items-center justify-between">
        <button className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg transition-colors bg-white">
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <div className="flex items-center gap-1 hidden sm:flex">
          <button className="w-8 h-8 rounded-lg bg-[#127C2F] text-white text-sm font-bold flex items-center justify-center">1</button>
          <button className="w-8 h-8 rounded-lg text-paragraph hover:text-black hover:bg-white-bg text-sm font-bold flex items-center justify-center">2</button>
          <button className="w-8 h-8 rounded-lg text-paragraph hover:text-black hover:bg-white-bg text-sm font-bold flex items-center justify-center">3</button>
          <span className="px-2 text-paragraph text-sm font-bold">...</span>
          <button className="w-8 h-8 rounded-lg text-paragraph hover:text-black hover:bg-white-bg text-sm font-bold flex items-center justify-center">8</button>
          <button className="w-8 h-8 rounded-lg text-paragraph hover:text-black hover:bg-white-bg text-sm font-bold flex items-center justify-center">9</button>
          <button className="w-8 h-8 rounded-lg text-paragraph hover:text-black hover:bg-white-bg text-sm font-bold flex items-center justify-center">10</button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg transition-colors bg-white">
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ActivityTab = () => {
  const mockActivities = [
    { id: 1, title: 'Submit Report', desc: 'Overflowing Bin — Yaba, Lagos', date: '2026-06-10 09:10' },
    { id: 2, title: 'Schedule Pickup', desc: 'Damaged Chair — Surulere, Lagos', date: '2026-06-13 14:00' },
    { id: 3, title: 'Update Status', desc: 'Broken Window — Victoria Island, Lagos', date: '2026-06-15 16:45' },
    { id: 4, title: 'Submit Report', desc: 'Overflowing Bin — Yaba, Lagos', date: '2026-06-10 09:10' },
    { id: 5, title: 'Request Maintenance', desc: 'Leaking Faucet — Ikoyi, Lagos', date: '2026-06-12 11:30' },
  ];

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 flex items-center justify-between border-b border-white-stroke">
        <h3 className="font-heading font-bold text-lg">Activity Timeline</h3>
      </div>
      
      <div className="p-6 flex flex-col gap-4 bg-white-bg/20">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="bg-white border border-white-stroke rounded-xl p-5 flex flex-col gap-1.5 shadow-xs">
            <h4 className="text-lg font-heading font-bold text-black">{activity.title}</h4>
            <p className="text-sm text-paragraph font-medium">{activity.desc}</p>
            <p className="text-[13px] text-paragraph mt-1">{activity.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
