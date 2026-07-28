import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sprout,
  Plus,
  FileText,
  CheckCircle2,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  MapPin,
  Zap,
  Gift,
  X,
  Smartphone,
  Home,
  Activity,
  Settings,
  Layers,
  Users,
  AlertCircle,
  MapPinned,
  List,
  RefreshCw,
  FileEdit
} from 'lucide-react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

import api from '../services/api';
import ReportListView from '../components/ReportListView';
const RegionalActivityMap = lazy(() => import('../components/RegionalActivityMap'));
import fallbackImage from '../assets/fallback-image.svg';
import { timeAgo } from '../utils/timeAgo';
import useInstallPrompt from '../hooks/useInstallPrompt';
import useIsPWA from '../hooks/useIsPWA';
import { generateTrendData, generateSparklinePath } from '../utils/trendUtils';

const LazyRender = ({ children, fallback }) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full">
      {isIntersecting ? children : fallback}
    </div>
  );
};

export default function HomePage() {
  const navigate = useNavigate();

  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'));
    return Boolean(token && token !== 'undefined' && token !== 'null');
  });

  useEffect(() => {
    const token = (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'));
    setIsLoggedIn(Boolean(token && token !== 'undefined' && token !== 'null'));
  }, [location.pathname]);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const { canInstall, promptInstall } = useInstallPrompt();
  const isPWA = useIsPWA();
  const [reports, setReports] = useState([]);
  const [mapStatus, setMapStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    totalCreditsEarned: 0
  });
  const [credits, setCredits] = useState(0);
  const [areaStats, setAreaStats] = useState({
    topActiveArea: 'Loading...',
    resolutionRate: 0
  });

  const fetchReports = async () => {
    try {
      setMapStatus('loading');

      // Fetch stats
      let globalResolutionRate = 0;
      try {
        const statsRes = await api.get('/reports/stats');
        const statsData = statsRes.data?.data || statsRes.data || {};
        setStats({
          totalReports: statsData.totalReports || 0,
          resolvedReports: statsData.resolvedReports || 0,
          totalCreditsEarned: statsData.totalCreditsEarned || 0,
        });
        if (statsData.totalReports > 0) {
          globalResolutionRate = Math.round(((statsData.resolvedReports || 0) / statsData.totalReports) * 100);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }

      try {
        const creditsRes = await api.get('/credits/balance');
        if (creditsRes?.data?.data?.creditBalance !== undefined) {
          setCredits(creditsRes.data.data.creditBalance);
        } else if (creditsRes?.data?.creditBalance !== undefined) {
          setCredits(creditsRes.data.creditBalance);
        }
      } catch (err) {
        // user not logged in or endpoint failed
      }

      let apiReports = [];
      try {
        const res = await api.get('/reports?page=0&size=50');
        const content = res.data?.data?.content || res.data?.content || res.data?.data || [];
        apiReports = Array.isArray(content) ? content : [];
      } catch (apiErr) {
        console.error('Failed to fetch live reports:', apiErr);
        setMapStatus('error');
        return;
      }
      
      // Calculate Area Stats dynamically as fallback/primary
      let topArea = 'Unavailable';
      if (apiReports.length > 0) {
        const areaCounts = {};
        apiReports.forEach(r => {
          const area = r.areaName || r.address || 'Unknown';
          const cleanArea = area.split(',')[0].trim(); // Get primary area from address
          areaCounts[cleanArea] = (areaCounts[cleanArea] || 0) + 1;
        });
        
        let maxCount = 0;
        for (const [area, count] of Object.entries(areaCounts)) {
          if (count > maxCount && !area.toLowerCase().includes('location') && area !== 'Unknown') {
            maxCount = count;
            topArea = area;
          }
        }
      }
      
      setAreaStats({
        topActiveArea: topArea !== 'Unavailable' ? topArea : 'N/A',
        resolutionRate: globalResolutionRate
      });



      const lagosLat = 6.5244;
      const lagosLng = 3.3792;
      const coordMap = new Map();
      const allReports = [...apiReports].map((r, idx) => {
        let lat = r.latitude ? parseFloat(r.latitude) : lagosLat;
        let lng = r.longitude ? parseFloat(r.longitude) : lagosLng;
        
        const key = `${lat},${lng}`;
        const count = coordMap.get(key) || 0;
        coordMap.set(key, count + 1);

        // Only apply jitter if there's a collision (count > 0)
        let jitterLat = 0;
        let jitterLng = 0;
        if (count > 0) {
          jitterLat = Math.sin(count * 1234) * 0.0003;
          jitterLng = Math.cos(count * 1234) * 0.0003;
        }
        
        return {
          ...r,
          latitude: lat + jitterLat,
          longitude: lng + jitterLng,
          rawDate: r.createdAt ? new Date(r.createdAt).getTime() : (r.date ? 0 : Date.now())
        };
      });
      
      allReports.sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));
      setReports(allReports);
      setMapStatus('success');
    } catch (err) {
      setMapStatus('error');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleViewAll = () => {
    if ((localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))) {
      navigate('/reports');
    } else {
      navigate('/login');
    }
  };

  const getUserFirstName = () => {
    try {
      const storedUser = (localStorage.getItem('user') || sessionStorage.getItem('user'));
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        const parsed = JSON.parse(storedUser);
        const name = String(parsed?.authorName || parsed?.displayName || parsed?.name || parsed?.fullName || parsed?.username || (localStorage.getItem('user_name') || sessionStorage.getItem('user_name')) || '');
        if (name && name.trim() !== '') {
          return name.split(' ')[0];
        }
        
        // Fallback to email
        const emailStr = String(parsed?.email || (localStorage.getItem('user_email') || sessionStorage.getItem('user_email')) || '');
        if (emailStr && typeof emailStr === 'string' && emailStr.includes('@')) {
           return emailStr.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim().split(' ')[0];
        }
      }
    } catch (e) {}
    
    const emailStr = (localStorage.getItem('user_email') || sessionStorage.getItem('user_email'));
    if (emailStr && typeof emailStr === 'string' && emailStr.includes('@')) {
       return emailStr.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim().split(' ')[0];
    }
    
    return 'there';
  };

  const firstName = getUserFirstName();

  const handleInstallClick = async () => {
    if (canInstall) {
      await promptInstall();
    } else {
      toast('App is already installed or install not available in this browser.', { icon: 'ℹ️' });
    }
  };

  const totalReportsTrend = generateTrendData('homeTotal', stats.totalReports);
  const resolvedReportsTrend = generateTrendData('homeResolved', stats.resolvedReports);
  const creditsTrend = generateTrendData('homeCredits', stats.totalCreditsEarned);
  
  const totalReportsPaths = generateSparklinePath(totalReportsTrend.dataPoints);
  const resolvedReportsPaths = generateSparklinePath(resolvedReportsTrend.dataPoints);
  const creditsPaths = generateSparklinePath(creditsTrend.dataPoints);

  return (
    <div className="min-h-screen bg-white-bg sm:bg-white font-body flex flex-col justify-between relative">
      <SEO title="Dashboard" description="Your CleanReport Dashboard - Overview of sanitation reports and activity in your area." />
      <div>
        <AppNavbar activeTab="dashboard" />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Conditional Hero Section based on Auth State */}
          {!isLoggedIn ? (
            /* Logged Out Hero Section: No action buttons below subtext */
            <>
              {/* Unified Hero Section for Logged Out Users */}
              <div className="mb-6 sm:mb-8">
                <h1 className="font-heading text-[30px] font-semibold leading-[38px] text-black mb-1 sm:mb-1.5 tracking-tight">
                  Clean and Report Waste Dumps
                </h1>
                <p className="text-xs sm:text-sm text-paragraph font-medium">
                  Report, track and monitor waste collection in your community
                </p>

                {/* Mobile-only action buttons below the text */}
                <div className="lg:hidden mt-6 flex flex-col gap-3">
                  <Link 
                    to="/register" 
                    className="w-full px-4 py-3 bg-primary text-white font-bold rounded-xl text-center shadow-sm text-[15px] hover:bg-primary/90 transition-all active:scale-95"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/login" 
                    className="w-full px-4 py-3 bg-white text-paragraph font-bold rounded-xl text-center shadow-sm text-[15px] border border-white-stroke hover:bg-white-bg transition-all active:scale-95"
                  >
                    Sign In
                  </Link>
                  {!isPWA && (
                    <button 
                      onClick={handleInstallClick}
                      className="w-full mt-2 text-sm text-primary font-bold underline hover:text-primary-hover text-center"
                    >
                      Install App
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Logged In Hero Section: Welcome back + Retrieve Reward & Add New Report buttons */
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="font-heading text-[30px] font-semibold leading-[38px] text-black mb-1 sm:mb-1.5 tracking-tight">
                  Welcome back, {firstName || 'there'}
                </h1>
                <p className="text-xs sm:text-sm text-paragraph font-medium">
                  Report, track and monitor waste collection in your community
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/rewards')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white-stroke bg-white text-black font-semibold text-xs sm:text-sm shadow-xs hover:bg-white-bg transition-colors"
                >
                  <Gift className="w-4 h-4 text-primary" /> {credits > 0 ? `${credits} Eco-Points` : 'Retrieve Reward'}
                </button>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm shadow-sm hover:bg-primary/90 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add New Report
                </Link>
              </div>
            </div>
          )}

          {/* Three Stat Cards — exact Figma structure */}
          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-4 mb-8 pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">

            {/* 1. Total Reports */}
            <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[280px] md:w-auto shrink-0 snap-center">
              {/* Sparkline — full-width absolute background, bottom half */}
              <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                  <path d={totalReportsPaths.fillPath} fill="#E9FFEA" />
                  <path d={totalReportsPaths.path} fill="none" stroke="#127C2F" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              </div>
              {/* Header row */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#006FED] flex items-center justify-center text-white shadow-sm shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-black">Total Reports</span>
                </div>
                <button className="text-black-icon hover:text-black shrink-0" aria-label="More options for Total Reports">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {/* Number + badge — same row, bottom */}
              <div className="flex items-baseline gap-3 mt-auto relative z-10">
                <span className="text-[28px] font-bold text-black tracking-tight leading-none">{stats.totalReports.toLocaleString()}</span>
                <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${totalReportsTrend.isPositive ? 'text-primary' : 'text-alert-error'}`}>
                  {totalReportsTrend.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />} {totalReportsTrend.percentage}%
                </span>
              </div>
            </div>

            {/* 2. Resolved Report */}
            <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[280px] md:w-auto shrink-0 snap-center">
              {/* Sparkline — full-width absolute background */}
              <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                  <path d={resolvedReportsPaths.fillPath} fill="#FFE8E8" />
                  <path d={resolvedReportsPaths.path} fill="none" stroke="#DB0404" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              </div>
              {/* Header row */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-black">Resolved Reports</span>
                </div>
                <button className="text-black-icon hover:text-black shrink-0" aria-label="More options for Resolved Reports">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {/* Number + badge — same row */}
              <div className="flex items-baseline gap-3 mt-auto relative z-10">
                <span className="text-[28px] font-bold text-black tracking-tight leading-none">{stats.resolvedReports.toLocaleString()}</span>
                <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${resolvedReportsTrend.isPositive ? 'text-primary' : 'text-alert-error'}`}>
                  {resolvedReportsTrend.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />} {resolvedReportsTrend.percentage}%
                </span>
              </div>
            </div>

            {/* 3. Community Points */}
            <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[280px] md:w-auto shrink-0 snap-center">
              {/* Sparkline — full-width absolute background */}
              <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                  <path d={creditsPaths.fillPath} fill="#E9FFEA" />
                  <path d={creditsPaths.path} fill="none" stroke="#127C2F" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              </div>
              {/* Header row */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-black shadow-sm shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-black">Community Points</span>
                </div>
                <button className="text-black-icon hover:text-black shrink-0" aria-label="More options for Community Points">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {/* Number + badge — same row */}
              <div className="flex items-baseline gap-3 mt-auto relative z-10">
                <span className="text-[28px] font-bold text-black tracking-tight leading-none">{stats.totalCreditsEarned.toLocaleString()}</span>
                <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${creditsTrend.isPositive ? 'text-primary' : 'text-alert-error'}`}>
                  {creditsTrend.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />} {creditsTrend.percentage}%
                </span>
              </div>
            </div>

          </div>

          {/* Dark Promo Banner — exact Figma colors and structure */}
          {!isBannerDismissed && !isPWA && (
          <div className="bg-[#001310] rounded-2xl p-5 sm:p-7 text-white relative overflow-hidden shadow-md mb-8">
            {/* X close button — top-right, exact Figma */}
            <button
              type="button"
              onClick={() => setIsBannerDismissed(true)}
              className="absolute top-4 right-4 text-white/50 hover:text-white/90 transition-colors z-20"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 pr-8">
              <div>
                {/* "MOBILE EXPERIENCE" label — #ABEFC6 as requested */}
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#ABEFC6] mb-3">
                  <Smartphone className="w-3.5 h-3.5 text-[#ABEFC6]" /> MOBILE EXPERIENCE
                </div>
                <h2 className="font-heading font-bold text-lg sm:text-xl text-white mb-2 leading-tight">
                  CleanReport on your Home Screen
                </h2>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-md">
                  Get instant notifications and report issues faster by installing CleanReport as a lightweight app. No store download required.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Install App — bg-[#ABEFC6] fill, #001310 text — exact Figma */}
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-2 bg-[#ABEFC6] text-[#001310] font-bold px-4 py-2.5 rounded-xl text-sm border border-[#ABEFC6] hover:bg-[#ABEFC6]/90 transition-colors shadow-sm"
                >
                  <Smartphone className="w-4 h-4 text-[#001310]" /> Install App
                </button>
                {/* Learn More — dark filled bg, white text — exact Figma */}
                <button
                  type="button"
                  onClick={() => toast.success('Learn more modal coming soon!')}
                  className="inline-flex items-center gap-1.5 bg-[#0a1f1c] border border-white/10 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Decorative Sprout watermark */}
            <Sprout className="w-40 h-40 absolute -left-6 -top-6 text-primary/10 pointer-events-none -rotate-12" />
          </div>
          )}

          {/* Main Layout Grid: Left Column (Regional Activity + Local Goals & Energy Saving) + Right Column (Recent Report) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Left Column (Span 7): Regional Activity Map + Bottom Two Cards */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* 1. Regional Activity Map Card */}
              <LazyRender fallback={
                <div className="bg-white border border-white-stroke rounded-2xl shadow-sm flex flex-col overflow-hidden h-[450px] items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
                  <p className="text-paragraph font-medium">Loading map module...</p>
                </div>
              }>
                <Suspense fallback={
                  <div className="bg-white border border-white-stroke rounded-2xl shadow-sm flex flex-col overflow-hidden h-[450px] items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
                    <p className="text-paragraph font-medium">Loading map module...</p>
                  </div>
                }>
                  <div className="bg-white border border-white-stroke rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
                    {reports.length === 0 ? (
                      <div className="h-[450px] w-full flex flex-col items-center justify-center bg-white z-[300] px-4 text-center">
                        <div className="w-16 h-16 bg-white border border-white-stroke rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                          <FileEdit className="w-8 h-8 text-black" />
                        </div>
                        <h3 className="font-heading font-bold text-lg sm:text-xl text-black mb-2">No Report on Map</h3>
                        <p className="text-xs sm:text-sm text-paragraph max-w-sm mb-8 leading-relaxed">
                          There is no map details showing regional activity reporting
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4">
                          <button 
                            onClick={() => navigate('/report')}
                            className="w-full sm:w-auto bg-primary text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm hover:bg-primary/90 transition-colors"
                          >
                            Manually Create a Report
                          </button>
                          <button 
                            className="w-full sm:w-auto bg-white border border-[#22c55e] text-black font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl hover:bg-white-bg transition-colors"
                          >
                            View Documentation
                          </button>
                        </div>
                      </div>
                    ) : (
                      <RegionalActivityMap reports={reports} mapStatus={mapStatus} onRetry={fetchReports} />
                    )}
                  </div>
                </Suspense>
              </LazyRender>

              {/* 2. Bottom Two Cards (Area Stats) placed inside Left Column right under Regional Activity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Top Active Area (Dark Card) */}
                <div className="bg-[#001310] text-white rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[170px] border border-white/10">
                  <div className="relative z-10 mb-6">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-white mb-1">
                      Top Active Area
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80 font-medium">
                      Area with the most community reports.
                    </p>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white truncate max-w-[200px]">
                        {areaStats.topActiveArea}
                      </span>
                    </div>
                  </div>

                  {/* Decorative Watermark */}
                  <MapPinned className="w-28 h-28 absolute -bottom-6 -right-6 text-[#ABEFC6]/15 pointer-events-none" />
                </div>

                {/* Resolution Rate (Light Card) */}
                <div className="bg-white border border-white-stroke rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[170px]">
                  <div className="relative z-10 mb-6">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-primary mb-1">
                      Resolution Rate
                    </h3>
                    <p className="text-xs sm:text-sm text-paragraph font-medium">
                      Average resolution rate across areas.
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 relative z-10">
                    <span className="text-2xl sm:text-3xl font-bold text-primary tracking-tight shrink-0">
                      {areaStats.resolutionRate}%
                    </span>
                    <p className="text-xs sm:text-sm text-primary leading-snug font-semibold">
                      Reports successfully resolved.
                    </p>
                  </div>

                  {/* Decorative Watermark */}
                  <Activity className="w-24 h-24 absolute -bottom-5 -right-5 text-primary/15 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right Column (Span 5): Recent Report stretching down alongside both Regional Activity & Bottom Cards */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-white border border-white-stroke rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between flex-1">
                <div className="flex flex-col justify-between flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-bold text-base sm:text-lg text-black">
                      Recent Report
                    </h2>
                    <button
                      type="button"
                      onClick={handleViewAll}
                      className="text-xs sm:text-sm font-semibold text-primary hover:underline cursor-pointer"
                    >
                      view all
                    </button>
                  </div>

                  {/* 6 Static Report Rows — evenly distributed across the entire card height to match Left Column perfectly */}
                  <div className="divide-y divide-white-stroke flex flex-col justify-between flex-1">
                    {reports.length === 0 && mapStatus === 'error' && (
                      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="w-16 h-16 bg-white-bg2 rounded-full flex items-center justify-center mb-4 border border-white-stroke">
                          <AlertCircle className="w-8 h-8 text-paragraph" />
                        </div>
                        <h3 className="text-black font-bold text-sm mb-1">Servers Waking Up</h3>
                        <p className="text-xs text-paragraph max-w-[240px] mx-auto mb-6 leading-relaxed">
                          Our backend goes to sleep to save energy. It usually takes ~60 seconds to wake up!
                        </p>
                        <button
                          onClick={fetchReports}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Retry Connection
                        </button>
                      </div>
                    )}
                    {reports.length === 0 && mapStatus === 'loading' && (
                      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-sm font-semibold text-paragraph">Loading recent reports...</span>
                      </div>
                    )}
                    {reports.length === 0 && mapStatus === 'success' && (
                      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="w-16 h-16 bg-white border border-white-stroke rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                          <FileEdit className="w-8 h-8 text-black" />
                        </div>
                        <h3 className="font-heading font-bold text-lg text-black mb-3">No Recent Report Yet</h3>
                        <p className="text-xs sm:text-sm text-paragraph max-w-[280px] mx-auto leading-relaxed mb-6">
                          When citizens submit sanitation issues through the mobile app, they will appear here in real-time for review and assignment.
                        </p>
                      </div>
                    )}
                    {reports.slice(0, 6).map((report, idx) => {
                      const status = (report.status || 'Reported').toLowerCase();
                      const statusConfig = {
                        'resolved': { bg: 'bg-alert-successLight', text: 'text-primary', border: 'border-alert-successStroke', label: 'Resolved' },
                        'inprogress': { bg: 'bg-alert-inprogressLight', text: 'text-alert-inprogress', border: 'border-alert-inprogressStroke', label: 'In Progress' },
                        'in progress': { bg: 'bg-alert-inprogressLight', text: 'text-alert-inprogress', border: 'border-alert-inprogressStroke', label: 'In Progress' },
                        'acknowledged': { bg: 'bg-alert-infoLight', text: 'text-alert-info', border: 'border-alert-infoStroke', label: 'Acknowledged' },
                      };
                      const config = statusConfig[status] || { bg: 'bg-alert-warningLight', text: 'text-accent', border: 'border-alert-warningStroke', label: 'Reported' };

                      return (
                        <div key={report.id || idx} className="py-3 flex flex-col justify-center first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`${config.bg} ${config.text} border ${config.border} px-2.5 py-0.5 rounded-full text-[11px] font-semibold`}>
                              {config.label}
                            </span>
                            <span className="text-[11px] text-black-placeholder">{timeAgo(report.createdAt || report.date)}</span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-black">{report.title || report.category || 'Sanitation Issue'}</h3>
                          <div className="flex items-center gap-1 text-[11px] text-black-icon mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {(report.address || report.areaName || '').includes('Location unavailable') 
                                ? 'Location not automatically captured' 
                                : (report.address || report.areaName || 'Location not captured')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating Action Button (FAB) always shown for quick reporting */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          to="/report"
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
          aria-label="New Report"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>

    </div>
  );
}
