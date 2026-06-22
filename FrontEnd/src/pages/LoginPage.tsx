// client/src/pages/LoginPage.tsx
/**
 * Modern Login Page - Sampling Inspection Control System
 * Enhanced with modern UI/UX design patterns
 */

import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/formatUtils';
import { Eye, EyeOff, Microscope, ClipboardCheck, ShieldCheck, BarChart3, Users, Database } from 'lucide-react';
import { AuthAPI } from '../services/authService';
import { required, validateSchema, type ValidationSchema } from '../utils/validation';
import sysconfigService from '../services/sysconfigService';


// ==================== INTERFACES ====================

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}

interface AuthUser {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  is_active: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  errors?: Record<string, string[]>;
}

// Validation schema using centralized utility
const loginValidationSchema: ValidationSchema<LoginFormData> = {
  username: required('Username is required'),
  password: required('Password is required'),
};


// ==================== LOGIN PAGE COMPONENT ====================

const LoginPage: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });

  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string>('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [cookieIssue, setCookieIssue] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [systemInfo, setSystemInfo] = useState<{
    system_name: string;
    system_version: string;
    system_updated: Date | null;
  }>({
    system_name: 'Quality Control System',
    system_version: '2.1.0',
    system_updated: null
  });

  // ==================== AUTHENTICATION FUNCTIONS ====================

  // Create AuthAPI instance
  const authAPI = new AuthAPI();

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const result = await authAPI.checkStatus();

      if (result.isAuthenticated && result.user) {
        setIsAuthenticated(true);
        setLoginMessage(`Welcome back, ${result.user.username}! Redirecting...`);

        setTimeout(() => {
          const intendedPath = sessionStorage.getItem('intendedPath') || '/dashboard';
          sessionStorage.removeItem('intendedPath');
          window.location.href = intendedPath;
        }, 1000);
      }
    } catch (error) {
      console.log('Auth check - user not logged in');
    }
  };


  const handleLogin = async (loginData: LoginFormData): Promise<void> => {
    try {
      const user = await authAPI.login({
        username: loginData.username,
        password: loginData.password
      });

      if (user) {
        // Mark the moment of a successful login. The fallback bounce-detection
        // in useEffect still uses this as a safety net, though the confirm
        // loop below should make the bounce impossible by construction.
        sessionStorage.setItem('qcv:login-attempt', String(Date.now()));

        setIsAuthenticated(true);
        setLoginMessage(`Welcome, ${user.username}!`);
        setFormErrors({});

        // User check-in is now fired from AuthContext.checkAuth() after the
        // post-redirect /status call confirms the session cookie persisted.
        // Firing it inline here raced against the cookie write on iPad Safari
        // and produced a 401 → "Authentication Error: session-expired" toast
        // layered on top of the success screen.

        // Confirm the session cookie actually persisted before navigating.
        // We only redirect once /api/auth/status returns authenticated:true,
        // which makes the iPad login bounce impossible by construction —
        // if the cookie didn't stick, we never leave this page, and the
        // cookieIssue banner surfaces an actionable message instead.
        const REDIRECT_DEADLINE_MS = 2000;
        const POLL_INTERVAL_MS = 250;
        const startedAt = Date.now();
        let confirmed = false;
        while (Date.now() - startedAt < REDIRECT_DEADLINE_MS) {
          try {
            const status = await authAPI.checkStatus();
            if (status.isAuthenticated) {
              confirmed = true;
              break;
            }
          } catch {
            // transient — try again until the deadline
          }
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        }

        if (confirmed) {
          const intendedPath = sessionStorage.getItem('intendedPath') || '/dashboard';
          sessionStorage.removeItem('intendedPath');
          window.location.href = intendedPath;
        } else {
          sessionStorage.removeItem('qcv:login-attempt');
          setIsAuthenticated(false);
          setLoginMessage('');
          setCookieIssue(true);
        }
      }
    } catch (error) {
      console.error('Login error:', error);

      // Check for database connection errors
      let errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';

      if (errorMessage.includes('Database connection') ||
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('getaddrinfo') ||
          errorMessage.includes('connection test failed')) {
        errorMessage = 'Database connection error. The server cannot connect to the database. Please contact the system administrator.';
      }

      setFormErrors({ general: errorMessage });
    }
  };

  // ==================== FORM HANDLERS ====================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name as keyof LoginFormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (formErrors.general) {
      setFormErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const validateForm = (data: LoginFormData): LoginFormErrors => {
    return validateSchema(data, loginValidationSchema);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      await handleLogin(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Check if redirected due to session expiry
    if (sessionStorage.getItem('session-expired') === '1') {
      setSessionExpired(true);
      sessionStorage.removeItem('session-expired');
    }

    // Detect a login loop: we landed back on /login despite a recent
    // successful login → the browser is not persisting the session cookie.
    // The redirect timer in handleLogin is 1500ms, so anything past that but
    // within a 30s window means we just got bounced back from /dashboard.
    const attempt = sessionStorage.getItem('qcv:login-attempt');
    if (attempt) {
      const elapsed = Date.now() - parseInt(attempt, 10);
      if (elapsed > 1500 && elapsed < 30000) {
        setCookieIssue(true);
      }
      sessionStorage.removeItem('qcv:login-attempt');
    }

    checkAuthStatus();
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async (): Promise<void> => {
    try {
      const response = await sysconfigService.getActiveSystemSetup();
      if (response.success && response.data) {
        setSystemInfo({
          system_name: response.data.system_name || 'Quality Control System',
          system_version: response.data.system_version || '2.1.0',
          system_updated: response.data.system_updated || null
        });
      }
    } catch (error) {
      console.error('Failed to load system info:', error);
      // Keep default values on error
    }
  };

  // ==================== RENDER ====================

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-md w-full mx-4 animate-scale-in">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20">
            <div className="text-center">
              <div className="flex justify-center mb-6 animate-bounce-in">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-300 animate-pulse-custom">
                  <Microscope className="w-12 h-12 text-white animate-float" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent animate-fade-in delay-100">
                Login Successful!
              </h2>
              <p className="mt-3 text-gray-600 animate-fade-in delay-200">{loginMessage}</p>

              <div className="mt-8 space-y-4 animate-fade-in delay-300">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full group relative flex items-center justify-center py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 animate-glow hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10-10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Go to Dashboard
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Two-Panel Layout Container */}
      <div className="relative max-w-6xl w-full mx-4 animate-scale-in">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid lg:grid-cols-2 min-h-[600px]">

            {/* Left Panel - Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-700 text-white relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 border-2 border-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-white rounded-full"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-8 max-w-md">
                <div className="flex justify-start animate-bounce-in">
                  <div className="p-6 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse-custom">
                    <Microscope className="w-24 h-24 text-white animate-float" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="text-left animate-slide-in-left delay-200">
                  <h1 className="text-4xl font-bold mb-4 leading-tight">
                    {systemInfo.system_name}
                  </h1>
                  <p className="text-lg text-orange-100 leading-relaxed">
                    Advanced sampling inspection and quality assurance platform for precision manufacturing excellence
                  </p>
                </div>

                <div className="pt-8 space-y-4">
                  <div className="flex items-start space-x-3 animate-fade-in delay-300">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 hover:scale-110">
                        <ClipboardCheck className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-white mb-1">{systemInfo.system_name}</h4>
                      <p className="text-sm text-orange-100 leading-relaxed">Streamlined quality control processes for efficient product inspection and defect tracking</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 animate-fade-in delay-400">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 hover:scale-110">
                        <BarChart3 className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-white mb-1">Real-time Analytics</h4>
                      <p className="text-sm text-orange-100 leading-relaxed">Comprehensive dashboards and reports for instant quality insights and trend analysis</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 animate-fade-in delay-500">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 hover:scale-110">
                        <Users className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-white mb-1">Team Collaboration</h4>
                      <p className="text-sm text-orange-100 leading-relaxed">Multi-user platform with role-based access control and collaborative workflows</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 animate-fade-in delay-600">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 hover:scale-110">
                        <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-white mb-1">Secure & Compliant</h4>
                      <p className="text-sm text-orange-100 leading-relaxed">Enterprise-grade security with compliance tracking and audit trails</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Login Form & System Info */}
            <div className="flex flex-col p-8 lg:p-12">
              {/* Mobile Header (visible only on small screens) */}
              <div className="lg:hidden text-center mb-6 animate-bounce-in">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg animate-pulse-custom">
                    <Microscope className="w-12 h-12 text-white animate-float" strokeWidth={1.5} />
                  </div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {systemInfo.system_name}
                </h1>
              </div>

              {/* Top Section - Login Form */}
              <div className="flex-1 flex flex-col justify-center">
                {/* Login Form Header */}
                <div className="mb-6 animate-slide-in-right">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to access the quality control dashboard</p>
                </div>

                {/* Session Expired Banner */}
                {sessionExpired && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6 animate-fade-in">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm font-medium text-amber-800">Your session has expired. Please log in again.</p>
                    </div>
                  </div>
                )}

                {/* Cookie persistence failure — login succeeded but browser dropped the session */}
                {cookieIssue && (
                  <div className="rounded-xl bg-red-50 border-2 border-red-300 p-4 mb-6 animate-fade-in">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-bold text-red-900 mb-1">
                          เข้าสู่ระบบไม่สำเร็จ — เบราว์เซอร์ไม่บันทึก session
                        </h3>
                        <p className="text-xs text-red-800 mb-2">
                          Login was accepted but your browser did not save the session cookie. Try one of the following:
                        </p>
                        <ul className="text-xs text-red-800 list-disc list-inside space-y-1">
                          <li>ปิดการแปลหน้าเว็บ (turn off page translation)</li>
                          <li>ออกจากโหมด Private Browsing</li>
                          <li>เปิดในแอป Safari หรือ Chrome ตามปกติ ไม่ใช่ in-app browser</li>
                          <li>ตรวจสอบให้เบราว์เซอร์ยอมรับ cookie จากเว็บนี้</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Messages */}
                {formErrors.general && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 animate-shake">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm font-medium text-red-800">{formErrors.general}</p>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username Field */}
                  <div className="space-y-2 animate-fade-in delay-100">
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                      Username
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`block w-full pl-12 pr-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                          formErrors.username
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white hover:border-orange-300'
                        }`}
                        placeholder="Enter your username"
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.username && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.username}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2 animate-fade-in delay-200">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`block w-full pl-12 pr-12 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                          formErrors.password
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white hover:border-orange-300'
                        }`}
                        placeholder="Enter your password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5 text-gray-400 hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`group relative w-full flex items-center justify-center py-4 px-6 text-white font-semibold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 animate-fade-in delay-400 ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] animate-glow'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Bottom Section - System Description */}
              <div className="pt-8 mt-8 border-t border-gray-200 animate-fade-in delay-500">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">About the System</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 animate-fade-in delay-600 hover:bg-orange-50 p-2 rounded-lg transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-orange-100 rounded-lg hover:bg-orange-200 hover:scale-110 transition-all duration-300">
                        <Database className="w-5 h-5 text-orange-600" strokeWidth={2} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Integration check-in from DBFVI</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">Getting data FVI Machine Line No., QC Id and Name, QC Shift </p>
                    </div>
                  </div>

                  <a href="/training" target="_blank" rel="noopener noreferrer" className="nav-link block">
                  <div className="flex items-start space-x-3 animate-fade-in delay-700 hover:bg-orange-50 p-2 rounded-lg transition-all duration-300 cursor-pointer">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-orange-100 rounded-lg hover:bg-orange-200 hover:scale-110 transition-all duration-300">
                        <Eye className="w-5 h-5 text-orange-600" strokeWidth={2} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">📚 Training Materials</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">

                               Training Materials And User Guide
                      </p>
                    </div>
                  </div>
                  </a>

                  <a href="/customer-data/format" target="_blank" rel="noopener noreferrer" className="nav-link block">
                  <div className="flex items-start space-x-3 animate-fade-in delay-750 hover:bg-orange-50 p-2 rounded-lg transition-all duration-300 cursor-pointer">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-orange-100 rounded-lg hover:bg-orange-200 hover:scale-110 transition-all duration-300">
                        <BarChart3 className="w-5 h-5 text-orange-600" strokeWidth={2} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">📊 Seagate Format</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                               Access Seagate Format Report (Opens in new tab)
                      </p>
                    </div>
                  </div>
                  </a>

                  <div className="flex items-start space-x-3 animate-fade-in delay-800 hover:bg-orange-50 p-2 rounded-lg transition-all duration-300 cursor-pointer">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-orange-100 rounded-lg hover:bg-orange-200 hover:scale-110 transition-all duration-300">
                        <Users className="w-5 h-5 text-orange-600" strokeWidth={2} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Guest Login </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                         Username: <span className="font-medium">guest</span> | Password: <span className="font-medium">guest1234</span>
                      </p>
                    </div>
                  </div>

                </div>

                {/* System Info */}
                <div className="mt-6 pt-4 border-t border-gray-100 animate-fade-in delay-900">
                  <p className="text-xs text-gray-500 text-center">
                    {systemInfo.system_name}
                  </p>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Version {systemInfo.system_version}
                    {systemInfo.system_updated && (
                      <> • Updated: {formatDate(systemInfo.system_updated)}</>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Powered by <span className="font-semibold text-orange-600">Tiger Solution Ltd.Co.</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }

        /* Fade In Animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        /* Slide In From Left */
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        /* Slide In From Right */
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }

        /* Float Animation */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Pulse Animation */
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(249, 115, 22, 0);
          }
        }
        .animate-pulse-custom {
          animation: pulse 2s ease-in-out infinite;
        }

        /* Scale In Animation */
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }

        /* Bounce In Animation */
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounceIn 0.6s ease-out forwards;
        }

        /* Rotate Animation */
        @keyframes rotateIn {
          from {
            opacity: 0;
            transform: rotate(-180deg) scale(0.5);
          }
          to {
            opacity: 1;
            transform: rotate(0deg) scale(1);
          }
        }
        .animate-rotate-in {
          animation: rotateIn 0.8s ease-out forwards;
        }

        /* Stagger Delay Classes */
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-750 { animation-delay: 0.75s; }
        .delay-800 { animation-delay: 0.8s; }
        .delay-900 { animation-delay: 0.9s; }

        /* Glow Animation */
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(249, 115, 22, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(251, 146, 60, 0.6);
          }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
