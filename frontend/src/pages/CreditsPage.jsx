import React, { useState, useEffect } from 'react';
import { Coins, Award, Zap, TrendingUp, History, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import api from '../services/api';

export default function CreditsPage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const { data } = await api.get('/credits/balance');
        const p = data?.data || data || {};
        setProfile({
          balance: p.balance ?? p.creditBalance ?? 0,
          lifetimeCredits: p.lifetimeCredits ?? 0,
          level: p.level || 'Starter',
          streakCount: p.streakCount ?? 0,
          multiplier: p.multiplier ?? 1.0,
          nextLevelAt: p.nextLevelAt ?? 100
        });
      } catch (error) {
        console.error('Failed to fetch credits profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBalance();
  }, []);

  const progressPct = profile ? Math.min(100, Math.round((profile.lifetimeCredits / profile.nextLevelAt) * 100)) : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-body flex flex-col">
      <SEO title="My Eco-Points" />
      <AppNavbar activeTab="credits" />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Eco-Points Profile</h1>
            <p className="text-gray-600">Track your impact, level up, and earn rewards.</p>
          </div>
          <Link to="/rewards" className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            Spend Points <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !profile ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-gray-500">Log in to view your Eco-Points profile.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Cards: Balance & Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-primary to-[#0e742a] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <p className="text-primary-100 font-medium text-sm mb-1 uppercase tracking-wider">Available Balance</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold font-heading">{profile.balance}</span>
                      <span className="text-xl text-primary-100 font-medium">Pts</span>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <p className="text-sm text-primary-50 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> {profile.lifetimeCredits} Lifetime Earned
                    </p>
                  </div>
                </div>
              </div>

              {/* Level Progress Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Current Level</p>
                        <h3 className="text-xl font-bold text-gray-900">{profile.level}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Multiplier</p>
                      <p className="text-lg font-bold text-primary">{profile.multiplier}x</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-gray-700">{profile.lifetimeCredits} XP</span>
                      <span className="text-gray-400">{profile.nextLevelAt} XP</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Earn {Math.max(0, profile.nextLevelAt - profile.lifetimeCredits)} more points to reach the next level!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak & History Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Streak Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 fill-yellow-600 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">{profile.streakCount} Days</h3>
                  <p className="text-sm text-gray-500 font-medium">Current Streak</p>
                </div>
              </div>

              {/* Missing History Alert */}
              <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center text-center sm:text-left sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Transaction History</h3>
                    <p className="text-sm text-gray-500">Coming soon in the next update!</p>
                  </div>
                </div>
                <button disabled className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed w-full sm:w-auto">
                  View All
                </button>
              </div>
            </div>

            {/* Mobile Action */}
            <div className="pt-4 sm:hidden">
              <Link to="/rewards" className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-bold text-gray-800 shadow-sm">
                Spend Points in Rewards Center
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
