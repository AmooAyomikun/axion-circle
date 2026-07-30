import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, MapPin } from 'lucide-react';
import api from '../services/api';
import Logo from '../components/Logo';
import SEO from '../components/SEO';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setServerError('Please enter your email and password.');
      return;
    }

    setServerError('');
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password,
        rememberMe: false,
      });

      const resData = response.data?.data || response.data;
      
      const parsedRole = resData?.role || resData?.accountType || resData?.user?.role || '';
      
      if (parsedRole !== 'ADMIN') {
        setServerError('Access denied: Administrator privileges required.');
        setIsSubmitting(false);
        return;
      }

      const accessToken =
        resData?.access_token ||
        resData?.accessToken ||
        resData?.token;
      const refreshToken =
        resData?.refresh_token || resData?.refreshToken;

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }

      const userObj = resData?.user || {
        email: resData?.email || email.trim(),
        role: parsedRole
      };
      
      localStorage.setItem('user', JSON.stringify(userObj));

      toast.success('Admin login successful!');
      navigate('/admin/reports');
    } catch (error) {
      if (error.isConnectionError || error.code === 'ECONNABORTED' || !error.response) {
        setServerError('Connection failed. Please try again.');
        return;
      }
      setServerError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-body bg-white-bg relative overflow-hidden p-6">
        <SEO title="Admin Login" />
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center" aria-hidden="true">
        <Logo className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] lg:w-[1000px] lg:h-[1000px] object-contain opacity-[0.04] grayscale" />
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-[20px] p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white-stroke">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <Logo className="w-16 h-16 object-contain mb-1" />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-black mb-1.5">
            Admin Login
          </h1>
          <p className="text-sm text-paragraph font-medium">
            Sign in to access the administrative dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Error Message */}
          <div aria-live="polite">
            {serverError && (
              <div className="p-3 bg-alert-errorLight border border-alert-error/20 rounded-lg text-alert-error text-sm font-medium mb-4">
                {serverError}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-black mb-1.5"
            >
              Email <span className="text-alert-error" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-white-stroke rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-black placeholder:text-black-placeholder bg-white-bg2/50 focus:bg-white"
              placeholder="superadmin@cleanreport.com"
              aria-required="true"
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-black mb-1.5"
            >
              Password <span className="text-alert-error" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-3 border border-white-stroke rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-black placeholder:text-black-placeholder bg-white-bg2/50 focus:bg-white tracking-widest font-medium"
                placeholder="*************"
                aria-required="true"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black-icon hover:text-black focus:outline-none p-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" />
                ) : (
                  <Eye className="w-[18px] h-[18px]" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={!email || !password || isSubmitting}
            className="w-full px-4 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm shadow-primary/20 flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
