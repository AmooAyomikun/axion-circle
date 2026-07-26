import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, ChevronDown, Mail, CheckCircle, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { uploadToCloudinary } from '../services/cloudinary';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import CustomCountrySelect from '../components/CustomCountrySelect';
import api from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
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
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    gender: '',
    email: '',
    address: '',
    avatarUrl: ''
  });

  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    try {
      const storedUserStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUserStr && storedUserStr !== 'undefined' && storedUserStr !== 'null') {
        const storedUser = JSON.parse(storedUserStr);
        setUser(storedUser);
        
        // Try to split displayName if specific name fields aren't present
        const names = (storedUser.displayName || '').split(' ');
        let fName = storedUser.firstName || names[0] || '';
        let lName = storedUser.lastName || (names.length > 1 ? names[names.length - 1] : '');
        let mName = storedUser.middleName || (names.length > 2 ? names.slice(1, -1).join(' ') : '');

        const mappedData = {
          firstName: fName,
          middleName: mName,
          lastName: lName,
          phone: storedUser.phone || '',
          gender: storedUser.gender || '',
          email: storedUser.email || (localStorage.getItem('user_email') || ''),
          address: storedUser.address || '',
          avatarUrl: storedUser.avatarUrl || ''
        };
        
        setFormData(mappedData);
        setInitialData(mappedData);
      } else {
        // Fallback
        const email = localStorage.getItem('user_email') || '';
        const mappedData = {
          firstName: '', middleName: '', lastName: '', phone: '', gender: '', email: email, address: '', avatarUrl: ''
        };
        setFormData(mappedData);
        setInitialData(mappedData);
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const loadingToast = toast.loading('Uploading profile picture...');
      
      const secureUrl = await uploadToCloudinary(file);
      
      setFormData(prev => ({ ...prev, avatarUrl: secureUrl }));
      
      // Update local storage immediately for avatar
      if (user) {
        const updatedUser = { ...user, avatarUrl: secureUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      toast.dismiss(loadingToast);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.dismiss();
      toast.error('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = () => {
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      setFormData(prev => ({ ...prev, avatarUrl: '' }));
      if (user) {
        const updatedUser = { ...user, avatarUrl: '' };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("First Name, Last Name, and Email are required.");
      return;
    }

    try {
      setIsSaving(true);
      
      // MOCK API CALL DELAY
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with real API call when backend endpoint is available
      // Example: await api.put('/users/me', formData);

      // Save to local storage to mock persistence
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        ...formData,
        displayName: `${formData.firstName} ${formData.lastName}`.trim()
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setInitialData(formData);
      
      setIsSuccess(true);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
  };

  const getInitials = (fName, lName, email) => {
    if (fName || lName) {
      return `${(fName || '').charAt(0)}${(lName || '').charAt(0)}`.toUpperCase();
    }
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const initials = getInitials(formData.firstName, formData.lastName, formData.email);
  const avatarFallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;

  if (!user && !formData.email) {
    return <div className="min-h-screen bg-white-bg flex items-center justify-center">Loading...</div>;
  }

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
            
            <h1 className="font-heading text-2xl font-bold text-black mb-2">Profile Updated</h1>
            <p className="text-gray-500 mb-8">Your profile setting have successfully updated</p>
            
            <button 
              onClick={() => setIsSuccess(false)}
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
        
        {/* Desktop Breadcrumb */}
        <div className="hidden md:flex items-center text-sm mb-10 text-gray-500 font-medium">
          <span className="hover:text-gray-700 cursor-pointer">Dashboard</span>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="hover:text-gray-700 cursor-pointer">Settings</span>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="text-primary font-semibold">User Profile</span>
        </div>

        {/* Mobile Heading */}
        <div className="md:hidden mb-6">
          <h1 className="text-2xl font-bold font-heading text-black mb-1">My Profile</h1>
          <p className="text-sm text-gray-500">Update your profile details</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          
          {/* Sidebar Nav */}
          <div className="w-full md:w-56 lg:w-64 flex-shrink-0">
            {/* Mobile Dropdown */}
            <div className="md:hidden mb-2 relative">
              <select 
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-black font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                value="/profile"
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
                className="text-left px-4 py-3 rounded-lg bg-gray-100 text-primary font-semibold text-sm"
              >
                My Profile
              </button>
              <button 
                onClick={() => navigate('/settings/password')}
                className="text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Password
              </button>
              <button className="text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">
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
            
            {/* Header / Action Buttons (Desktop) */}
            <div className="hidden md:flex justify-end items-center mb-6 space-x-3 border-b border-gray-100 pb-4">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-5 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors flex items-center"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Read-Only State Header */}
            {!isEditing && (
              <div className="flex flex-col md:flex-row items-center md:items-start md:mb-10 mb-8 border-b border-gray-100 pb-8 text-center md:text-left">
                <div className="mb-4 md:mb-0 md:mr-6">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Profile"
                      loading="lazy"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-gray-200 object-cover shadow-sm"
                      onError={(e) => { e.target.onerror = null; e.target.src = avatarFallbackUrl; }}
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-gray-200 bg-primary/10 flex items-center justify-center text-primary text-4xl font-heading font-bold shadow-sm">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center h-full pt-2 md:pt-4">
                  <h2 className="text-2xl font-bold font-heading text-black">
                    {`${formData.firstName} ${formData.lastName}`.trim() || 'Community Member'}
                  </h2>
                  <p className="text-gray-500 mt-1">Community Member</p>
                  
                  {/* Mobile Edit Button */}
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="md:hidden mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium text-sm inline-flex items-center justify-center w-full max-w-[200px] mx-auto"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            )}

            {/* Edit Avatar Row */}
            {isEditing && (
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-gray-100">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-semibold text-black mb-1">Your photo</h3>
                  <p className="text-sm text-gray-500">This will be displayed on your profile.</p>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {formData.avatarUrl ? (
                      <img
                        src={formData.avatarUrl}
                        alt="Profile"
                        loading="lazy"
                        className="w-16 h-16 rounded-full border border-gray-200 object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = avatarFallbackUrl; }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full border border-gray-200 bg-primary/10 flex items-center justify-center text-primary text-xl font-heading font-bold">
                        {initials}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 text-sm font-semibold">
                    <button onClick={handleImageDelete} className="text-gray-500 hover:text-red-500 transition-colors">Delete</button>
                    <button onClick={() => fileInputRef.current?.click()} className="text-primary hover:text-primary/80 transition-colors">Update</button>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    title="Upload profile picture"
                  />
                </div>
              </div>
            )}

            {/* Form Fields Container */}
            <div className="space-y-6">
              
              {/* First Name */}
              <div className="flex flex-col md:flex-row md:items-center">
                <label htmlFor="firstName" className="md:w-1/3 text-sm font-semibold text-gray-700 mb-1.5 md:mb-0">First Name</label>
                <div className="md:w-2/3">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="enter your first name"
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:bg-white disabled:text-gray-800 transition-colors"
                  />
                </div>
              </div>

              {/* Middle Name */}
              <div className="flex flex-col md:flex-row md:items-center">
                <label htmlFor="middleName" className="md:w-1/3 text-sm font-semibold text-gray-700 mb-1.5 md:mb-0">Middle Name</label>
                <div className="md:w-2/3">
                  <input
                    id="middleName"
                    name="middleName"
                    type="text"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="enter middle name"
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:bg-white disabled:text-gray-800 transition-colors"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="flex flex-col md:flex-row md:items-center">
                <label htmlFor="lastName" className="md:w-1/3 text-sm font-semibold text-gray-700 mb-1.5 md:mb-0">Last Name</label>
                <div className="md:w-2/3">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="enter last name"
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:bg-white disabled:text-gray-800 transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col md:flex-row md:items-center">
                <label htmlFor="phone" className="md:w-1/3 text-sm font-semibold text-gray-700 mb-1.5 md:mb-0">Phone Number</label>
                <div className="md:w-2/3">
                  <div className={`w-full border border-gray-300 rounded-lg py-2.5 px-3 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-colors ${!isEditing ? 'bg-white text-gray-800' : 'bg-white text-gray-900'}`}>
                    <PhoneInput
                      international
                      defaultCountry="US"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
                      disabled={!isEditing}
                      placeholder="+1 908 765 4321"
                      className="w-full h-full custom-phone-input"
                      countrySelectComponent={CustomCountrySelect}
                    />
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div className="flex flex-col md:flex-row md:items-center">
                <label htmlFor="gender" className="md:w-1/3 text-sm font-semibold text-gray-700 mb-1.5 md:mb-0">Gender</label>
                <div className="md:w-2/3 relative">
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:bg-white disabled:text-gray-800 transition-colors bg-white"
                  >
                    <option value="" disabled>select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col md:flex-row md:items-center">
                <label htmlFor="email" className="md:w-1/3 text-sm font-semibold text-gray-700 mb-1.5 md:mb-0">Email Address</label>
                <div className="md:w-2/3 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="example@gmail.com"
                    className="w-full border border-gray-300 rounded-lg py-2.5 pl-9 pr-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:bg-white disabled:text-gray-800 transition-colors"
                  />
                </div>
              </div>

              {/* Home Address */}
              <div className="flex flex-col md:flex-row md:items-start pt-1">
                <label htmlFor="address" className="md:w-1/3 text-sm font-semibold text-gray-700 mb-1.5 md:mb-0 pt-2">Home Address</label>
                <div className="md:w-2/3">
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Add your address..."
                    rows={4}
                    maxLength={400}
                    aria-describedby="address-char-count"
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:bg-white disabled:text-gray-800 transition-colors resize-none"
                  ></textarea>
                  <div id="address-char-count" className="text-xs text-gray-500 mt-1.5 text-left">
                    {400 - (formData.address?.length || 0)} characters left
                  </div>
                </div>
              </div>

            </div>

            {/* Mobile Action Buttons */}
            {isEditing && (
              <div className="md:hidden flex justify-end items-center mt-10 pt-6 border-t border-gray-100 space-x-3">
                <button 
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-colors flex items-center"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
            
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
