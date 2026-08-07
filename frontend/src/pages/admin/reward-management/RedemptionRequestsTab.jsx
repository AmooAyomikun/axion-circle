import React, { useState } from 'react';
import { Search, ArrowLeft, ArrowRight, Eye, ChevronDown } from 'lucide-react';
import { MOCK_REDEMPTION_REQUESTS } from './mockData';

export default function RedemptionRequestsTab() {
  const [requests, setRequests] = useState(MOCK_REDEMPTION_REQUESTS);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [page, setPage] = useState(0);
  const totalPages = 1;

  const filteredRequests = requests.filter(req => 
    req.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#FEF9C3] text-[#A16207]';
      case 'Approved':
      case 'Collected':
        return 'bg-[#E9FFEA] text-[#127C2F]';
      case 'Rejected':
        return 'bg-[#FEE2E2] text-[#EF4444]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm flex flex-col w-full h-full">
      <div className="p-4 sm:p-5 border-b border-white-stroke flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-heading font-bold text-lg text-black">Redemption Requests</h2>
        
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black-icon" />
          <input 
            type="text" 
            placeholder="Search requests" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-white-stroke bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-white border-b border-white-stroke text-xs font-semibold text-paragraph h-[44px]">
              <th className="px-4 py-3 whitespace-nowrap">User Name</th>
              <th className="px-4 py-3 whitespace-nowrap">Store Name</th>
              <th className="px-4 py-3 whitespace-nowrap">Category</th>
              <th className="px-4 py-3 whitespace-nowrap">Credits</th>
              <th className="px-4 py-3 whitespace-nowrap">Date</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white-stroke text-sm">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-12 text-center text-paragraph">
                  No redemption requests found.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-white-bg/50 transition-colors bg-white h-[72px]">
                  <td className="px-4 py-4">
                    <span className="font-bold text-[#1F2937] text-sm">{req.userName}</span>
                  </td>
                  <td className="px-4 py-4 text-[#4B5563] font-medium text-sm">
                    {req.storeName}
                  </td>
                  <td className="px-4 py-4 text-[#4B5563] font-medium text-sm">
                    {req.category}
                  </td>
                  <td className="px-4 py-4 font-bold text-sm text-primary">
                    {req.credits.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-[#4B5563] font-medium text-sm">
                    {new Date(req.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[12px] font-bold rounded-full ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      className="p-2 text-black-icon hover:text-primary transition-colors focus:outline-none bg-white-bg rounded-lg mx-auto"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 sm:p-5 border-t border-white-stroke flex items-center justify-between">
        <button 
          disabled={page === 0}
          onClick={() => setPage(p => Math.max(0, p - 1))}
          className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        
        <div className="flex items-center justify-center flex-1 gap-1 hidden sm:flex">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors bg-[#127C2F] text-white shadow-sm"
          >
            1
          </button>
        </div>

        <button 
          disabled={page >= totalPages - 1}
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
