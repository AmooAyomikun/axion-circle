import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import AppNavbar from '../../components/AppNavbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import SEO from '../../components/SEO';

// A reusable accessible toggle switch component
const ToggleSwitch = ({ label, checked, onChange, disabled }) => (
  <label className="flex items-center cursor-pointer relative w-full sm:w-auto">
    <input 
      type="checkbox" 
      className="sr-only peer" 
      checked={checked} 
      onChange={onChange} 
      disabled={disabled}
      aria-label={label}
    />
    <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
    <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>
  </label>
);

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [email, setEmail] = useState('');

  const [preferences, setPreferences] = useState({
    comments: { push: true, email: true, sms: false },
    tags: { push: true, email: false, sms: false },
    reminders: { push: false, email: false, sms: false },
    moreActivity: { push: false, email: false, sms: false }
  });
  const [isSaving, setIsSaving] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread notifications count
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

    const fetchPreferences = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/users/me/preferences');
        const prefs = data.data || data;
        
        // Only update if the backend actually returns the detailed structure
        if (prefs && prefs.comments && prefs.tags) {
          setPreferences(prefs);
        }
      } catch (error) {
        toast.error("Failed to load notification settings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = (category, channel) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel]
      }
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await api.patch('/users/me/preferences', preferences);
      toast.success("Preferences saved successfully!");
    } catch (error) {
      toast.error("Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubscribing(true);
      // MOCK API CALL
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await api.post('/newsletter/subscribe', { email });
      toast.success("Subscribed successfully!");
      setEmail('');
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white-bg font-body flex flex-col">
        <SEO title="Notifications" />
      <AppNavbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {/* Desktop Breadcrumb */}
        <div className="hidden md:flex items-center text-sm mb-10 text-gray-500 font-medium">
          <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate('/')}>Dashboard</span>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate('/profile')}>Settings</span>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="text-primary font-semibold">Notification</span>
        </div>

        {/* Mobile Heading */}
        <div className="md:hidden mb-6">
          <h1 className="text-2xl font-bold font-heading text-black mb-1">Notification Setting</h1>
          <p className="text-sm text-gray-500">We may still send you important notifications about your account outside of your notification settings.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          
          {/* Sidebar Nav */}
          <div className="w-full md:w-56 lg:w-64 flex-shrink-0">
            {/* Mobile Dropdown */}
            <div className="md:hidden mb-2 relative">
              <select 
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-black font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                value="/settings/notifications"
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
                className="text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Password
              </button>
              <button className="text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm flex justify-between items-center transition-colors">
                Support
              </button>
              <button 
                onClick={() => navigate('/settings/notifications')}
                className="text-left px-4 py-3 rounded-lg bg-gray-100 text-primary font-semibold text-sm flex justify-between items-center transition-colors"
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
              <div className="hidden md:block mb-8">
                <h2 className="text-xl font-bold text-black mb-1">Notification settings</h2>
                <p className="text-sm text-gray-500">We may still send you important notifications about your account outside of your notification settings.</p>
              </div>

              {isLoading ? (
                /* Skeleton Loader */
                <div className="space-y-8 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:justify-between gap-4">
                      <div className="w-2/3">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Settings Categories */
                <div className="space-y-8">
                  {/* Comments */}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div className="sm:w-2/3 md:pr-8">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Comments</h3>
                      <p className="text-sm text-gray-500">These are notifications for comments on your posts and replies to your comments.</p>
                    </div>
                    <div className="flex flex-col space-y-4 sm:w-1/3 sm:items-start">
                      <ToggleSwitch label="Push" checked={preferences.comments.push} onChange={() => handleToggle('comments', 'push')} />
                      <ToggleSwitch label="Email" checked={preferences.comments.email} onChange={() => handleToggle('comments', 'email')} />
                      <ToggleSwitch label="SMS" checked={preferences.comments.sms} onChange={() => handleToggle('comments', 'sms')} />
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Tags */}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div className="sm:w-2/3 md:pr-8">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Tags</h3>
                      <p className="text-sm text-gray-500">These are notifications for when someone tags you in a comment, post or story.</p>
                    </div>
                    <div className="flex flex-col space-y-4 sm:w-1/3 sm:items-start">
                      <ToggleSwitch label="Push" checked={preferences.tags.push} onChange={() => handleToggle('tags', 'push')} />
                      <ToggleSwitch label="Email" checked={preferences.tags.email} onChange={() => handleToggle('tags', 'email')} />
                      <ToggleSwitch label="SMS" checked={preferences.tags.sms} onChange={() => handleToggle('tags', 'sms')} />
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Reminders */}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div className="sm:w-2/3 md:pr-8">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Reminders</h3>
                      <p className="text-sm text-gray-500">These are notifications to remind you of updates you might have missed.</p>
                    </div>
                    <div className="flex flex-col space-y-4 sm:w-1/3 sm:items-start">
                      <ToggleSwitch label="Push" checked={preferences.reminders.push} onChange={() => handleToggle('reminders', 'push')} />
                      <ToggleSwitch label="Email" checked={preferences.reminders.email} onChange={() => handleToggle('reminders', 'email')} />
                      <ToggleSwitch label="SMS" checked={preferences.reminders.sms} onChange={() => handleToggle('reminders', 'sms')} />
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* More activity about you */}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div className="sm:w-2/3 md:pr-8">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">More activity about you</h3>
                      <p className="text-sm text-gray-500">These are notifications for posts on your profile, likes and other reactions to your posts, and more.</p>
                    </div>
                    <div className="flex flex-col space-y-4 sm:w-1/3 sm:items-start">
                      <ToggleSwitch label="Push" checked={preferences.moreActivity.push} onChange={() => handleToggle('moreActivity', 'push')} disabled={isSaving} />
                      <ToggleSwitch label="Email" checked={preferences.moreActivity.email} onChange={() => handleToggle('moreActivity', 'email')} disabled={isSaving} />
                      <ToggleSwitch label="SMS" checked={preferences.moreActivity.sms} onChange={() => handleToggle('moreActivity', 'sms')} disabled={isSaving} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button 
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 flex items-center justify-center shadow-sm"
                    >
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Promo Card at the bottom */}
              {!isLoading && (
                <div className="mt-10 bg-white border border-gray-200 rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="md:w-1/2">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">We've just released a new update!</h3>
                    <p className="text-sm text-gray-500">Check out the all new dashboard view. Pages and now load faster.</p>
                  </div>
                  <div className="w-full md:w-1/2">
                    <label htmlFor="subscribeEmail" className="block text-sm font-medium text-gray-700 mb-2">Subscribe to updates</label>
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="subscribeEmail"
                          name="email"
                          autoComplete="email"
                          placeholder="example@gmail.com"
                          className="pl-10 w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isSubscribing}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors disabled:opacity-70 flex items-center justify-center"
                      >
                        {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
