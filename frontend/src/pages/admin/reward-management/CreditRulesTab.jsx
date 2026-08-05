import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import { MOCK_CREDIT_RULES } from './mockData';
import toast from 'react-hot-toast';

export default function CreditRulesTab() {
  const [rules, setRules] = useState(MOCK_CREDIT_RULES);

  const handleToggleActive = (id) => {
    setRules(prev => prev.map(rule => {
      if (rule.id === id) {
        const newStatus = !rule.isActive;
        toast.success(`Rule ${newStatus ? 'enabled' : 'disabled'} successfully`);
        return { ...rule, isActive: newStatus };
      }
      return rule;
    }));
  };

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm flex flex-col w-full h-full">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-white-stroke">
        <h2 className="font-heading font-bold text-[19px] text-black">Credit Rules</h2>
      </div>

      {/* Card Content - List of rules */}
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        {rules.map((rule) => (
          <div 
            key={rule.id} 
            className="border border-white-stroke rounded-xl p-4 sm:px-5 sm:py-4 flex flex-wrap gap-4 items-center justify-between bg-white transition-shadow hover:shadow-xs"
          >
            <div className="flex flex-col">
              <h3 className="text-lg font-medium text-[#1F2937] mb-1 leading-tight">{rule.name}</h3>
              <p className="text-[13px] font-semibold text-[#127C2F]">+{rule.credits} credits</p>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Toggle Switch */}
              <button 
                onClick={() => handleToggleActive(rule.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${rule.isActive ? 'bg-[#127C2F]' : 'bg-[#D1D5DB]'}`}
                aria-label={`Toggle ${rule.name}`}
              >
                <span
                  className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform ${rule.isActive ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
                />
              </button>
              
              {/* Edit Button */}
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 border border-white-stroke rounded-[8px] text-[13px] font-semibold text-[#6B7280] hover:text-black hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none"
                title="Edit Rule"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
