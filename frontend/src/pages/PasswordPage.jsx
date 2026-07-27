import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function PasswordPage() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data } = await api.get('/notifications/unread-count');
        const unreadResponse = data.data || data;
        setUnreadCount(unreadResponse.unreadCount ?? unreadResponse.unread_count ?? 0);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };
    fetchUnreadCount();
  }, []);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required.';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (formData.newPassword.length <= 8) {
      newErrors.newPassword = 'Your new password must be more than 8 characters.';
    }

    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Confirm new password is required.';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      
      // MOCK API CALL DELAY
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with real API call when backend endpoint is available
      // Example: await api.post('/users/me/password', { currentPassword, newPassword });

      setIsSuccess(true);
    } catch (error) {
      toast.error("Failed to update password. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setErrors({});
    navigate('/profile');
  };

  // SUCCESS STATE VIEW
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white-bg font-body flex flex-col">
        <AppNavbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full flex flex-col items-center">
            {/* Confetti & Checkmark Mock */}
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center relative z-10 shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              {/* Simple decorative elements simulating confetti */}
              <div className="absolute top-0 -left-4 w-3 h-3 rounded-full bg-accent animate-pulse"></div>
              <div className="absolute top-4 -right-6 w-4 h-4 bg-blue-400 rotate-45 animate-pulse"></div>
              <div className="absolute bottom-2 -left-6 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 -right-4 w-4 h-4 rounded-full bg-purple-400 animate-pulse"></div>
            </div>
            
            <h1 className="font-heading text-2xl font-bold text-black mb-2">Password Updated</h1>
            <p className="text-gray-500 mb-8">Your password has been changed successfully.</p>
            
            <button 
              onClick={() => navigate('/profile')}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Back to Settings
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white-bg font-body flex flex-col">
      <AppNavbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        <div className="hidden md:flex items-center text-sm mb-10 text-gray-500 font-medium">
          <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate('/')}>Dashboard</span>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate('/profile')}>Settings</span>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="text-primary font-semibold">Password</span>
        </div>

        {/* Mobile Heading */}
        <div className="md:hidden mb-6">
          <h1 className="text-2xl font-bold font-heading text-black mb-1">Change Password</h1>
          <p className="text-sm text-gray-500">Please enter your current password to change your password.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          
          {/* Sidebar Nav */}
          <div className="w-full md:w-56 lg:w-64 flex-shrink-0">
            {/* Mobile Dropdown */}
            <div className="md:hidden mb-2 relative">
              <select 
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-black font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                value="/settings/password"
                onChange={(e) => navigate(e.target.value)}
              >
                <option value="/profile">My details</option>
                <option value="/settings/password">Password</option>
                <option value="/profile">Support</option>
                <option value="/settings/notifications">Notifications</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col space-y-1">
              <button 
                onClick={() => navigate('/profile')}
                className="text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                My Profile
              </button>
              <button 
                onClick={() => navigate('/settings/password')}
                className="text-left px-4 py-3 rounded-lg bg-gray-100 text-primary font-semibold text-sm"
              >
                Password
              </button>
              <button className="text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm flex justify-between items-center transition-colors">
                Support
              </button>
              <button 
                onClick={() => navigate('/settings/notifications')}
                className="text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm flex justify-between items-center transition-colors"
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-white border border-gray-200 text-gray-600 py-0.5 px-2.5 rounded-full text-xs font-semibold">{unreadCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 w-full max-w-3xl pb-10">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              
              {/* Desktop Form Heading */}
              <div className="hidden md:block mb-6">
                <h2 className="text-xl font-bold text-black mb-1">Password</h2>
                <p className="text-sm text-gray-500">Please enter your current password to change your password.</p>
                <hr className="mt-6 border-gray-100" />
              </div>

              <div className="space-y-6">
                
                {/* Current Password */}
                <div>
                  <label 
                    htmlFor="currentPassword" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Current password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
                    aria-invalid={errors.currentPassword ? "true" : "false"}
                  />
                  {errors.currentPassword && (
                    <p id="currentPassword-error" className="mt-1 text-sm text-red-500" aria-live="polite">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label 
                    htmlFor="newPassword" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    aria-describedby={errors.newPassword ? "newPassword-error" : "newPassword-helper"}
                    aria-invalid={errors.newPassword ? "true" : "false"}
                  />
                  {errors.newPassword ? (
                    <p id="newPassword-error" className="mt-1 text-sm text-red-500" aria-live="polite">
                      {errors.newPassword}
                    </p>
                  ) : (
                    <p id="newPassword-helper" className="mt-1 text-sm text-gray-500">
                      Your new password must be more than 8 characters.
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label 
                    htmlFor="confirmNewPassword" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    aria-describedby={errors.confirmNewPassword ? "confirmNewPassword-error" : undefined}
                    aria-invalid={errors.confirmNewPassword ? "true" : "false"}
                  />
                  {errors.confirmNewPassword && (
                    <p id="confirmNewPassword-error" className="mt-1 text-sm text-red-500" aria-live="polite">
                      {errors.confirmNewPassword}
                    </p>
                  )}
                </div>

              </div>

              <hr className="my-8 border-gray-100" />

              {/* Action Buttons */}
              <div className="flex flex-row justify-end items-center space-x-4">
                <button 
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="w-1/2 md:w-auto px-4 md:px-8 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-1/2 md:w-auto px-4 md:px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors flex justify-center items-center"
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
