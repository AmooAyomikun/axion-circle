import React, { useState } from 'react';
import { Edit, Copy, Trash2 } from 'lucide-react';
import { MOCK_CREDIT_RULES } from './mockData';
import toast from 'react-hot-toast';
import NewCreditRuleModal from '../../../components/modals/NewCreditRuleModal';

export default function CreditRulesTab({ isModalOpen, setIsModalOpen }) {
  const [rules, setRules] = useState(MOCK_CREDIT_RULES);
  const [editingRule, setEditingRule] = useState(null);

  const handleToggleActive = (id) => {
    setRules(prev => prev.map(rule => {
      if (rule.id === id) {
        const newStatus = !rule.enabled;
        toast.success(`Rule ${newStatus ? 'enabled' : 'disabled'} successfully`);
        return { ...rule, enabled: newStatus };
      }
      return rule;
    }));
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDuplicate = (rule) => {
    setEditingRule({ ...rule, id: null, isDuplicate: true });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this credit rule?')) {
      setRules(prev => prev.filter(rule => rule.id !== id));
      toast.success('Credit rule deleted successfully');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingRule(null), 200); // Wait for modal exit animation
  };

  const handleSaveRule = (savedRule) => {
    setRules(prev => {
      const exists = prev.find(r => r.id === savedRule.id);
      if (exists) {
        return prev.map(r => r.id === savedRule.id ? savedRule : r);
      }
      return [savedRule, ...prev];
    });
  };

  return (
    <div className="w-full h-full">
      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules.map((rule) => (
          <div 
            key={rule.id} 
            className="bg-white rounded-[20px] shadow-sm flex flex-col w-full overflow-hidden"
          >
            <div className="p-6 flex flex-col flex-1">
              
              {/* Header: Title, Pill, Toggle */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-black font-heading leading-tight">{rule.title}</h3>
                  {rule.enabled && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E7F2E9] text-[#127C2F]">
                      <span className="w-1.5 h-1.5 bg-[#127C2F] rounded-full mr-1.5"></span>
                      Active
                    </span>
                  )}
                </div>
                {/* Toggle Switch */}
                <button 
                  onClick={() => handleToggleActive(rule.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${rule.enabled ? 'bg-[#127C2F]' : 'bg-[#D1D5DB]'}`}
                  aria-label={`Toggle ${rule.title}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${rule.enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
                  />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-paragraph mb-6 min-h-[40px]">
                {rule.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                <div className="bg-[#F9FAFB] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-semibold text-paragraph mb-1">Award</span>
                  <span className="text-lg font-bold text-black font-heading">+{rule.award}</span>
                </div>
                <div className="bg-[#FFFDF5] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-semibold text-paragraph mb-1">Multiplier</span>
                  <span className="text-lg font-bold text-black font-heading">{rule.multiplier}x</span>
                </div>
                <div className="bg-[#F0FDF4] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-semibold text-paragraph mb-1">Daily cap</span>
                  <span className="text-lg font-bold text-black font-heading">{rule.dailyCap}</span>
                </div>
                <div className="bg-[#F3F4F6] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-semibold text-paragraph mb-1">Monthly cap</span>
                  <span className="text-lg font-bold text-black font-heading">{rule.monthlyCap}</span>
                </div>
              </div>

              {/* Monthly Cap Usage Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] text-paragraph font-medium">Monthly cap usage</span>
                  <span className="text-[13px] text-paragraph font-bold">{rule.monthlyCapUsage}%</span>
                </div>
                <div 
                  className="w-full bg-[#E5E7EB] rounded-full h-2" 
                  role="progressbar" 
                  aria-valuenow={rule.monthlyCapUsage} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  <div 
                    className="bg-[#127C2F] h-2 rounded-full" 
                    style={{ width: `${rule.monthlyCapUsage}%` }}
                  ></div>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-auto space-y-1 mb-6">
                <p className="text-[13px] text-paragraph">
                  Trigger: {rule.trigger} · Applies to: {rule.appliesTo}
                </p>
                <p className="text-[13px] text-paragraph">
                  Updated {rule.updatedAt} by {rule.updatedBy}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white-stroke">
                <button 
                  onClick={() => handleEdit(rule)}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-[#127C2F] text-[#127C2F] rounded-xl text-sm font-semibold hover:bg-[#F0FDF4] transition-colors"
                  aria-label={`Edit ${rule.title}`}
                >
                  <Edit className="w-4 h-4" />
                  Edit Rule
                </button>
                <button 
                  onClick={() => handleDuplicate(rule)}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-white-stroke text-paragraph rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                  aria-label={`Duplicate ${rule.title}`}
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button 
                  onClick={() => handleDelete(rule.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-[#FCA5A5] text-[#EF4444] rounded-xl text-sm font-semibold hover:bg-[#FEF2F2] transition-colors"
                  aria-label={`Delete ${rule.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      <NewCreditRuleModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSaveRule}
        editRule={editingRule}
      />
    </div>
  );
}
