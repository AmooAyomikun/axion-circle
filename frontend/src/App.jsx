import React, { useEffect, Suspense, lazy, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminRoute from './components/AdminRoute';
import ConnectionLostModal from './components/ConnectionLostModal';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';

const HomePage = lazy(() => import('./pages/HomePage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ReportDetailPage = lazy(() => import('./pages/ReportDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MyReportsPage = lazy(() => import('./pages/MyReportsPage'));
const CreditsPage = lazy(() => import('./pages/CreditsPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PasswordPage = lazy(() => import('./pages/PasswordPage'));
const NotificationsPage = lazy(() => import('./pages/settings/NotificationsPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const AdminReportDetailPage = lazy(() => import('./pages/AdminReportDetailPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));


// A simple loading fallback reusing the existing spinner style
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white-bg">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-paragraph text-sm font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  const location = useLocation();
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Deferred GA pageview tracking — lazy import, doesn't block UI
  useEffect(() => {
    const timer = setTimeout(() => {
      import('react-ga4').then(({ default: ReactGA }) => {
        try {
          ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
        } catch (e) {
          // GA may not be initialized yet, that's fine
        }
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, [location]);

  // Deferred Facebook SDK — only after user interaction or 8s timeout
  useEffect(() => {
    const initFacebookSDK = () => {
      if (window.FB || document.getElementById('facebook-jssdk')) return;
      const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
      if (!appId || appId === '%VITE_FACEBOOK_APP_ID%') return;

      window.fbAsyncInit = function () {
        window.FB.init({ appId, cookie: true, xfbml: true, version: 'v19.0' });
      };
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      document.body.appendChild(js);
    };

    let timer;
    const onInteraction = () => {
      clearTimeout(timer);
      initFacebookSDK();
    };
    document.addEventListener('click', onInteraction, { once: true });
    document.addEventListener('scroll', onInteraction, { once: true, passive: true });
    document.addEventListener('keydown', onInteraction, { once: true });
    timer = setTimeout(initFacebookSDK, 8000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', onInteraction);
      document.removeEventListener('scroll', onInteraction);
      document.removeEventListener('keydown', onInteraction);
    };
  }, []);

  return (
    <>
      {!isSplashComplete && <SplashScreen onComplete={() => setIsSplashComplete(true)} />}
      <Toaster position="top-right" />
      <ConnectionLostModal />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiesPage />} />

          {/* Authenticated Routes */}
          <Route path="/my-reports" element={<MyReportsPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings/password" element={<PasswordPage />} />
          <Route path="/settings/notifications" element={<NotificationsPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
          <Route path="/admin/reports/:id" element={<AdminRoute><AdminReportDetailPage /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App;
