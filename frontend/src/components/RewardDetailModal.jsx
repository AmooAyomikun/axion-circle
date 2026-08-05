import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function RewardDetailModal({ reward, onClose, onClaimSuccess }) {
  const [liveBalance, setLiveBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    
    // Fetch live balance
    const fetchBalance = async () => {
      try {
        const res = await api.get('/credits/balance');
        setLiveBalance(res.data?.data?.balance || 0);
      } catch (err) {
        console.error('Failed to fetch live balance', err);
        // Fallback to 0 if fails, handled gracefully
      } finally {
        setIsLoadingBalance(false);
      }
    };
    
    fetchBalance();

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!reward) return null;

  const cost = reward.creditsRequired || 0;
  const stock = reward.quantityAvailable || 0;
  const isAffordable = liveBalance >= cost;
  
  // Progress bar calculation
  let progressPercent = 0;
  if (cost > 0) {
    progressPercent = Math.min(100, (liveBalance / cost) * 100);
  } else if (cost === 0 && liveBalance >= 0) {
    progressPercent = 100;
  }
  
  const balanceAfter = Math.max(0, liveBalance - cost);
  const shortfall = Math.max(0, cost - liveBalance);
  const isOutOfStock = stock <= 0;

  const handleClaim = async () => {
    if (!isAffordable || isOutOfStock || isClaiming) return;
    
    // Prevent claiming mock rewards which causes backend 500 errors
    if (typeof reward.id === 'string' && reward.id.startsWith('m')) {
      setClaimError('Cannot claim a mock reward. Please add real rewards to the database.');
      return;
    }

    setIsClaiming(true);
    setClaimError('');
    try {
      await api.post(`/rewards/${reward.id}/claim`);
      toast.success(`Successfully claimed ${reward.name}!`);
      onClaimSuccess();
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to claim reward. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-modal-title"
    >
      <div 
        className="bg-white w-full max-w-[800px] sm:rounded-xl rounded-t-[12px] shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300"
      >
        {/* Header Image Area */}
        <div className="relative h-[219px] sm:h-[250px] bg-gray-200 w-full flex-shrink-0">
          <img 
            src={reward.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80'} 
            alt={reward.name} 
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
            {reward.category || 'Reward'}
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 flex flex-col">
          
          <h2 id="reward-modal-title" className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-2 leading-tight">
            {reward.name}
          </h2>
          <p className="text-base text-gray-600 mb-8">
            {reward.description || 'Redeemable at any partner location'}
          </p>

          {/* 3 Stat Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
            <div className="bg-[#F9F5FF] rounded-2xl flex flex-col items-center justify-center py-5 px-2 text-center">
              <span className="text-xs text-gray-500 font-medium mb-1">Cost</span>
              <span className="font-bold text-3xl sm:text-4xl leading-none text-gray-900 mb-2">{cost}</span>
              <span className="text-xs text-[#127C2F] font-medium">Credits</span>
            </div>
            <div className="bg-[#F0F9FF] rounded-2xl flex flex-col items-center justify-center py-5 px-2 text-center">
              <span className="text-xs text-gray-500 font-medium mb-1">in stock</span>
              <span className="font-bold text-3xl sm:text-4xl leading-none text-gray-900 mb-2">{stock}</span>
              <span className="text-xs text-[#127C2F] font-medium">
                <span className="hidden md:inline">Claims</span>
                <span className="md:hidden">Credits</span>
              </span>
            </div>
            <div className="bg-[#FEF3C7] rounded-2xl flex flex-col items-center justify-center py-5 px-2 text-center">
              <span className="text-xs text-gray-500 font-medium mb-1">Balance after</span>
              {isLoadingBalance ? (
                <div className="w-8 h-8 my-1 rounded-full border-2 border-gray-300 border-t-[#127C2F] animate-spin" />
              ) : (
                <span className="font-bold text-3xl sm:text-4xl leading-none text-gray-900 mb-2">{balanceAfter}</span>
              )}
              <span className="text-xs text-[#127C2F] font-medium">Credits</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 flex items-center relative rounded-full bg-gray-100 h-2.5 w-full overflow-hidden">
            <div 
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
              className="absolute left-0 top-0 bottom-0 bg-[#127C2F] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Error message */}
          {claimError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-lg border border-red-100">
              {claimError}
            </div>
          )}

          {/* How to redeem */}
          <div className="border border-gray-200 rounded-xl px-4 py-3 mb-4 mt-2">
            <h3 className="font-bold text-lg text-gray-900 mb-2">How to redeem</h3>
            <ol className="list-decimal pl-4 space-y-1.5 text-sm sm:text-base text-gray-600">
              <li>Confirm the claim to reserve your gift card.</li>
              <li>Wait for approval, then show the code in store.</li>
              <li>Mark it as collected once redeemed.</li>
            </ol>
          </div>

          {/* Terms & conditions */}
          <div className="border border-gray-200 rounded-xl px-4 py-3 mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Terms & conditions</h3>
            <ol className="list-decimal pl-4 space-y-1.5 text-sm sm:text-base text-gray-600">
              <li>Non-refundable and cannot be exchanged for credits</li>
              <li>Valid for 6 months from the approval date.</li>
              <li>Present the code at any participating partner café.</li>
            </ol>
          </div>

          <button
            onClick={handleClaim}
            disabled={!isAffordable || isOutOfStock || isClaiming || isLoadingBalance}
            aria-disabled={(!isAffordable || isOutOfStock || isClaiming || isLoadingBalance).toString()}
            className={`w-full py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 flex-shrink-0
              ${isAffordable && !isOutOfStock 
                ? 'bg-[#127C2F] text-white hover:bg-[#0e6325]' 
                : 'bg-[#CBD5E1] text-white cursor-not-allowed'
              }
            `}
          >
            {isClaiming ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : isAffordable ? (
              `Claim Rewards for ${cost} Credits`
            ) : (
              `Need ${shortfall} more Credits`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
