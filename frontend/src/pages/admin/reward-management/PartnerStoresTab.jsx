import React, { useState } from 'react';
import { Search, ArrowLeft, ArrowRight, Edit, AlertCircle } from 'lucide-react';
import { MOCK_PARTNER_STORES } from './mockData';
import toast from 'react-hot-toast';
import AddPartnerStoreModal from '../../../components/modals/AddPartnerStoreModal';

export default function PartnerStoresTab({ isModalOpen, setIsModalOpen }) {
  const [stores, setStores] = useState(MOCK_PARTNER_STORES);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStore, setEditingStore] = useState(null);
  
  const [page, setPage] = useState(0);
  const totalPages = 1;

  const handleEdit = (store) => {
    setEditingStore(store);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingStore(null), 200);
  };

  const handleSaveStore = (savedStore) => {
    setStores(prev => {
      const exists = prev.find(s => s.id === savedStore.id);
      if (exists) {
        return prev.map(s => s.id === savedStore.id ? savedStore : s);
      }
      return [savedStore, ...prev];
    });
  };

  const handleToggleStatus = (id) => {
    setStores(prev => prev.map(store => {
      if (store.id === id) {
        const isSuspended = store.status === 'Suspended';
        const newStatus = isSuspended ? 'Active' : 'Suspended';
        toast.success(`Store ${isSuspended ? 'activated' : 'suspended'} successfully`);
        return { ...store, status: newStatus };
      }
      return store;
    }));
  };

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    store.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm flex flex-col w-full h-full">
      <div className="p-4 sm:p-5 border-b border-white-stroke flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-heading font-bold text-lg text-black">Partner Stores</h2>
        
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black-icon" />
          <input 
            type="text" 
            placeholder="Search stores" 
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
              <th className="px-4 py-3 whitespace-nowrap">Store Name</th>
              <th className="px-4 py-3 whitespace-nowrap">Category</th>
              <th className="px-4 py-3 whitespace-nowrap">Location</th>
              <th className="px-4 py-3 whitespace-nowrap">Redemption Limit</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap w-[146px]">Action</th>
              <th className="px-4 py-3 whitespace-nowrap w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white-stroke text-sm">
            {filteredStores.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-12 text-center text-paragraph">
                  No partner stores found.
                </td>
              </tr>
            ) : (
              filteredStores.map((store) => {
                const isSuspended = store.status === 'Suspended';
                
                return (
                  <tr key={store.id} className="hover:bg-white-bg/50 transition-colors bg-white h-[72px]">
                    <td className="px-4 py-4">
                      <span className="font-bold text-[#1F2937] text-sm">{store.name}</span>
                    </td>
                    <td className="px-4 py-4 text-[#4B5563] font-medium text-sm">
                      {store.category}
                    </td>
                    <td className="px-4 py-4 text-[#4B5563] font-medium text-sm">
                      {store.location}
                    </td>
                    <td className="px-4 py-4 text-[#4B5563] font-medium text-sm">
                      {store.redemptionLimit}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSuspended ? 'bg-[#EF4444]' : 'bg-[#127C2F]'}`}></span>
                        <span className={`text-[13px] font-bold ${isSuspended ? 'text-[#EF4444]' : 'text-[#127C2F]'}`}>
                          {store.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 w-[146px]">
                      <button 
                        onClick={() => handleToggleStatus(store.id)}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all w-full max-w-[100px] block
                          ${isSuspended 
                            ? 'bg-[#E9FFEA] text-[#127C2F] hover:bg-[#E9FFEA]/80' 
                            : 'bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FEE2E2]/80'
                          }
                        `}
                      >
                        {isSuspended ? 'Activate' : 'Suspend'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => handleEdit(store)}
                        className="p-2 text-black-icon hover:text-primary transition-colors focus:outline-none bg-white-bg rounded-lg"
                        title="Edit Store"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
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

      <AddPartnerStoreModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSaveStore}
        editStore={editingStore}
      />
    </div>
  );
}
