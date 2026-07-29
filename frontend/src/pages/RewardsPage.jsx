import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Coins, CheckCircle, Info, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import api from '../services/api';
import SEO from '../components/SEO';

export default function RewardsPage() {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'my_claims'

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // If not logged in, we can still fetch rewards, but credits & claims will fail (which is fine)
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const reqs = [api.get('/rewards')];
      if (token) {
        reqs.push(api.get('/credits/balance').catch(() => ({ data: { data: { creditBalance: 0 } } })));
        reqs.push(api.get('/rewards/my-claims').catch(() => ({ data: { data: [] } })));
      }

      const [rewardsRes, creditsRes, claimsRes] = await Promise.all(reqs);

      setRewards(rewardsRes.data?.data || []);
      
      if (creditsRes) {
        const bal = creditsRes.data?.data?.creditBalance ?? creditsRes.data?.creditBalance ?? 0;
        setCredits(bal);
      }
      if (claimsRes) {
        setMyClaims(claimsRes.data?.data || claimsRes.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch rewards data:', error);
      toast.error('Failed to load rewards. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaim = async (reward) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to claim rewards.');
      navigate('/login');
      return;
    }

    if (credits < reward.creditsRequired) {
      toast.error("You don't have enough Eco-Points for this reward.");
      return;
    }

    try {
      setIsClaiming(true);
      await api.post(`/rewards/${reward.id}/claim`);
      toast.success(`Successfully claimed ${reward.name}!`);
      // Refresh data
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to claim reward.';
      toast.error(msg);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-white-bg font-body flex flex-col">
        <SEO title="Rewards" />
      <AppNavbar activeTab="rewards" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-black mb-2 flex items-center gap-3">
              Rewards Center <Gift className="w-6 h-6 text-primary" />
            </h1>
            <p className="text-paragraph text-sm sm:text-base">
              Redeem your Eco-Points for amazing community rewards.
            </p>
          </div>

          {/* Credits Balance Card */}
          <div className="bg-white border border-white-stroke p-4 rounded-2xl shadow-sm flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 bg-[#E9FFEA] rounded-full flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-paragraph font-medium mb-0.5">Your Balance</p>
              <p className="text-2xl font-bold text-black leading-none">{credits} <span className="text-sm font-medium text-gray-500">Pts</span></p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-gray-200 pb-px">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'catalog' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reward Catalog
          </button>
          <button
            onClick={() => setActiveTab('my_claims')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'my_claims' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Claims
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading rewards...</p>
          </div>
        ) : activeTab === 'catalog' ? (
          <>
            {rewards.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No rewards available</h3>
                <p className="text-gray-500 text-sm">Check back later for exciting new rewards!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <div key={reward.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="w-full h-48 bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                      {reward.imageUrl ? (
                        <img loading="lazy" src={reward.imageUrl} alt={reward.name} className="w-full h-full object-cover" />
                      ) : (
                        <Gift className="w-16 h-16 text-gray-200" />
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-black mb-1">{reward.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{reward.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-primary">
                        <Coins className="w-4 h-4" /> {reward.creditsRequired} Pts
                      </div>
                      
                      <button
                        onClick={() => handleClaim(reward)}
                        disabled={isClaiming || credits < reward.creditsRequired || reward.quantityAvailable <= 0}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                          reward.quantityAvailable <= 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : credits < reward.creditsRequired
                            ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-sm'
                        }`}
                      >
                        {reward.quantityAvailable <= 0 
                          ? 'Out of Stock' 
                          : credits < reward.creditsRequired 
                            ? 'Not Enough Pts' 
                            : 'Claim Reward'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* My Claims Tab */
          <>
            {myClaims.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl">
                <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No claims yet</h3>
                <p className="text-gray-500 text-sm">You haven't claimed any rewards. Browse the catalog to spend your points!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myClaims.map((claim) => (
                  <div key={claim.id} className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 hidden sm:flex items-center justify-center">
                      {claim.reward?.imageUrl ? (
                        <img loading="lazy" src={claim.reward.imageUrl} alt={claim.reward.name} className="w-full h-full object-cover" />
                      ) : (
                        <Gift className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-black">{claim.reward?.name || 'Unknown Reward'}</h4>
                      <p className="text-sm text-gray-500 mb-2">Claimed on {new Date(claim.claimedAt).toLocaleDateString()}</p>
                      {claim.redemptionCode && (
                        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md">
                          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Code:</span>
                          <span className="font-mono font-bold text-black">{claim.redemptionCode}</span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        claim.status === 'APPROVED' ? 'bg-status-resolved/10 text-status-resolved border-status-resolved/20' :
                        claim.status === 'PENDING' ? 'bg-status-acknowledged/10 text-status-acknowledged border-status-acknowledged/20' :
                        claim.status === 'COLLECTED' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                        'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
