// client/src/pages/profile/ProfileEditPage.tsx
// Profile Edit Page - Consistent with Master Data Layout
// Manufacturing Quality Control System

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  UserIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  UserCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import {
  validateUserProfileForm,
  hasValidationErrors,
  type UserValidationErrors
} from '../../utils/usersUtils';
import { useShiftOptions } from '../../services/sysconfigService';

interface ProfileFormData {
  name: string;
  email: string;
  position: string;
  work_shift: string;
  team: string;
  linevi: string;
}

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, checkAuth, updateUser } = useAuth();
  const { options: shiftOptions, loading: shiftLoading } = useShiftOptions();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    position: '',
    work_shift: '',
    team: '',
    linevi: ''
  });

  const [errors, setErrors] = useState<UserValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data only once when currentUser is available
  useEffect(() => {
    if (currentUser && !isInitialized) {
      console.log('🔄 Initial load: Setting form data from currentUser');
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        position: currentUser.position || '',
        work_shift: currentUser.work_shift || '',
        team: currentUser.team || '',
        linevi: currentUser.linevi || ''
      });
      setIsInitialized(true);
    }
  }, [currentUser, isInitialized]);

  useEffect(() => {
    if (!currentUser) {
      console.log('❌ No currentUser, redirecting to login');
      navigate('/login');
    } else {
      console.log('✅ currentUser exists:', currentUser.id, currentUser.name);
    }
  }, [currentUser, navigate]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof UserValidationErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof UserValidationErrors]: undefined }));
    }
    setNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    const validationErrors = validateUserProfileForm({
      name: formData.name,
      email: formData.email,
      position: formData.position
    });

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      setNotification({ type: 'error', message: 'Please fix the errors below' });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      console.log('🚀 Sending update request...', {
        id: currentUser.id,
        data: {
          name: formData.name,
          email: formData.email,
          position: formData.position,
          work_shift: formData.work_shift,
          team: formData.team,
          linevi: formData.linevi
        }
      });

      const response = await userService.updateUser(currentUser.id, {
        name: formData.name,
        email: formData.email,
        position: formData.position,
        work_shift: formData.work_shift,
        team: formData.team,
        linevi: formData.linevi
      });

      console.log('📨 Full response received:', response);
      console.log('📊 Response.success:', response.success);
      console.log('📊 Response.data:', response.data);

      if (response.success) {
        console.log('✅ Update successful!');

        // 1. Update form immediately with fresh data from server
        if (response.data) {
          console.log('📝 Updating form with server data:', response.data);
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            position: response.data.position || '',
            work_shift: response.data.work_shift || '',
            team: response.data.team || '',
            linevi: response.data.linevi || ''
          });
        } else {
          console.warn('⚠️ No data in response, keeping current form values');
        }

        // 2. Update AuthContext with new user data (without page reload)
        if (response.data) {
          updateUser(response.data);
          console.log('✅ AuthContext updated with new profile data');
        }

        // 3. Show success notification
        setNotification({ type: 'success', message: 'Profile updated successfully!' });
        console.log('🔔 Success notification set:', { type: 'success', message: 'Profile updated successfully!' });

        // Force scroll to top to see notification
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error('❌ Update failed:', response.message);
        setNotification({ type: 'error', message: response.message || 'Failed to update profile' });
        console.log('🔔 Error notification set');
      }
    } catch (err: any) {
      console.error('💥 Exception caught:', err);
      setNotification({ type: 'error', message: err.message || 'Network error occurred' });
    } finally {
      setIsSaving(false);
      console.log('🏁 Save process completed');
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
    { label: 'Edit Profile', href: '/profile/edit' }
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
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Edit Profile</h1>
            <p className="text-indigo-100 text-lg">Update your personal and work information</p>
          </div>
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <UserCircleIcon className="h-8 w-8 text-white" />
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

      {/* Profile Form */}
      <form onSubmit={handleSubmit}>
        {/* Cards in Same Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-blue-50">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                <UserIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Basic Information
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.name
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.email
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <BriefcaseIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleChange('position', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.position
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter your position"
                    />
                  </div>
                  {errors.position && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.position}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-blue-50">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                <BriefcaseIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Work Information
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Work Shift */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Shift
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                      <ClockIcon className="w-5 h-5" />
                    </div>
                    <select
                      value={formData.work_shift}
                      onChange={(e) => handleChange('work_shift', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-gray-400 cursor-pointer appearance-none"
                      disabled={shiftLoading}
                    >
                      <option value="">Select shift</option>
                      {shiftOptions.map((shift) => (
                        <option key={shift.value} value={shift.value}>
                          {shift.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* FVI Line */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FVI Line
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.linevi}
                      onChange={(e) => handleChange('linevi', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-gray-400"
                      placeholder="Enter FVI line"
                    />
                  </div>
                </div>

                {/* Team */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <BuildingOfficeIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.team}
                      onChange={(e) => handleChange('team', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-gray-400"
                      placeholder="Enter team name"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="mt-6 bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border border-gray-200 rounded-lg shadow-lg">
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
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
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

export default ProfileEditPage;
