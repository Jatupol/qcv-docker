// client/src/pages/profile/PasswordChangePage.tsx
// Password Change Page - Consistent with Master Data Layout
// Manufacturing Quality Control System

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  KeyIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  SparklesIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import {
  validatePasswordChangeForm,
  hasValidationErrors,
  type UserValidationErrors
} from '../../utils/usersUtils';

interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const PasswordChangePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState<PasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<UserValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof UserValidationErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof UserValidationErrors]: undefined }));
    }
    setNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    const validationErrors = validatePasswordChangeForm({
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    });

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      setNotification({ type: 'error', message: 'Please fix the errors below' });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      const response = await userService.changePassword(currentUser.id, {
        currentPassword: '',
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.success) {
        setNotification({ type: 'success', message: 'Password changed successfully!' });

        // Clear form after successful password change
        setFormData({
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setNotification({ type: 'error', message: response.message || 'Failed to change password' });
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      setNotification({ type: 'error', message: err.message || 'Network error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!currentUser) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/profile/edit' },
    { label: 'Change Password', href: '/profile/password' }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Change Password</h1>
            <p className="text-indigo-100 text-lg">Secure your account with a new password</p>
          </div>
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <LockClosedIcon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Toast Notification - Positioned above form */}
      {notification && (
        <div key={notification.message + notification.type} className="relative animate-slideDown">
          <div className="mb-6">
            <div className={`
              p-5 rounded-xl border-l-4 shadow-2xl transform transition-all duration-300
              ${notification.type === 'success' ? 'bg-green-100 border-green-600' : ''}
              ${notification.type === 'error' ? 'bg-red-100 border-red-600' : ''}
              ${notification.type === 'warning' ? 'bg-yellow-100 border-yellow-600' : ''}
              ${notification.type === 'info' ? 'bg-blue-100 border-blue-600' : ''}
            `}>
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  {/* Icon */}
                  <div className="flex-shrink-0 mr-4">
                    {notification.type === 'success' && (
                      <svg className="w-7 h-7 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {notification.type === 'error' && (
                      <svg className="w-7 h-7 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {notification.type === 'warning' && (
                      <svg className="w-7 h-7 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {/* Message */}
                  <div className="flex-1">
                    <p className={`text-base font-bold ${
                      notification.type === 'success' ? 'text-green-900' : ''
                    }${notification.type === 'error' ? 'text-red-900' : ''}${
                      notification.type === 'warning' ? 'text-yellow-900' : ''
                    }${notification.type === 'info' ? 'text-blue-900' : ''}`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  className={`ml-4 flex-shrink-0 rounded-md p-1 inline-flex hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    notification.type === 'success' ? 'text-green-600 focus:ring-green-500' : ''
                  }${notification.type === 'error' ? 'text-red-600 focus:ring-red-500' : ''}${
                    notification.type === 'warning' ? 'text-yellow-600 focus:ring-yellow-500' : ''
                  }${notification.type === 'info' ? 'text-blue-600 focus:ring-blue-500' : ''}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Form Card */}
      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <KeyIcon className="h-6 w-6 mr-2 text-indigo-600" />
              New Password
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <KeyIcon className="w-5 h-5" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => handleChange('newPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.newPassword
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                    {errors.newPassword}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500 flex items-center">
                  <ShieldCheckIcon className="w-4 h-4 mr-1" />
                  Password must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.confirmPassword
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Security Tips */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2 flex items-center">
                      <SparklesIcon className="w-4 h-4 mr-1 text-blue-600" />
                      Security Tips
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Use a strong, unique password with mix of characters</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Don't reuse passwords from other accounts</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Consider using a password manager for safety</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Form Actions */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Changing...
                </>
              ) : (
                <>
                  <KeyIcon className="w-5 h-5 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>

      {/* Slide Down Animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PasswordChangePage;
