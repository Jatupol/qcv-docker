// client/src/components/users/UserFormSection.tsx
// Embedded User Form Component - Create and Edit Operations

import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import LoadingSpinner from '../ui/LoadingSpinner';
import Card,{  CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { 
  User, 
  CreateUserFormData, 
  UpdateUserFormData, 
  UserFormErrors 
} from '../../types/user';

// ==================== INTERFACES ====================

interface UserFormSectionProps {
  mode: 'create' | 'edit';
  user?: User | null;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData) => Promise<{ 
    success: boolean; 
    errors?: UserFormErrors; 
    message?: string; 
  }>;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  position: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  is_active: boolean;
}

// ==================== USER FORM SECTION COMPONENT ====================

const UserFormSection: React.FC<UserFormSectionProps> = ({
  mode,
  user,
  onSubmit,
  onCancel,
  loading = false,
  className = ''
}) => {
  // ============ STATE ============
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    position: '',
    role: 'user',
    is_active: true
  });

  const [errors, setErrors] = useState<UserFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);

  // ============ EFFECTS ============

  // Reset form when mode changes or user data changes
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        username: user.username,
        email: user.email || '',
        password: '',
        confirmPassword: '',
        name: user.name,
        position: user.position || '',
        role: user.role,
        is_active: user.is_active
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        position: '',
        role: 'user',
        is_active: true
      });
    }
    setErrors({});
    setIsDirty(false);
    setUpdatePassword(false);
  }, [mode, user]);

  // ============ VALIDATION ============

  const validateForm = (): UserFormErrors => {
    const newErrors: UserFormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = ['Username is required'];
    } else if (formData.username.length < 3) {
      newErrors.username = ['Username must be at least 3 characters'];
    }  
    // Email validation (optional, but if provided must be valid)
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ['Please enter a valid email address'];
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = ['Name is required'];
    }  

    // Password validation (for create mode or edit mode with updatePassword enabled)
    if (mode === 'create' || (mode === 'edit' && updatePassword)) {
      if (!formData.password) {
        newErrors.password = ['Password is required'];
      } else if (formData.password.length < 8) {
        newErrors.password = ['Password must be at least 8 characters'];
      } 
    

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = ['Please confirm your password'];
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = ['Passwords do not match'];
      }
    }

    // Position validation (optional)
    if (formData.position && formData.position.length > 100) {
      newErrors.position = ['Position must be less than 100 characters'];
    }

    return newErrors;
  };

  // ============ HANDLERS ============

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors for this field
    if (errors[name as keyof UserFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      let submitData: CreateUserFormData | UpdateUserFormData;
      
      if (mode === 'create') {
        submitData = {
          username: formData.username.trim(),
          email: formData.email.trim() !== '' ? formData.email.trim().toLowerCase() : '',
          password: formData.password,
          name: formData.name.trim(),
          position: formData.position.trim() || undefined,
          role: formData.role,
          is_active: formData.is_active
        };
      } else {
        // For edit mode: Don't send username (it's read-only)
        submitData = {
          email: formData.email.trim() !== '' ? formData.email.trim().toLowerCase() : '',
          name: formData.name.trim(),
          role: formData.role,
          is_active: formData.is_active
        };

        // Only include position if it has a value
        if (formData.position && formData.position.trim()) {
          (submitData as any).position = formData.position.trim();
        }

        // Include password if updatePassword is enabled
        if (updatePassword && formData.password) {
          (submitData as any).password = formData.password;
        }
      }

      console.log('📤 Form Submit Data:', JSON.stringify(submitData, null, 2));

      const result = await onSubmit(submitData);
      
      if (result.success) {
        setIsDirty(false);
        // Form will be reset by parent component
      } else {
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Are you sure? You have unsaved changes that will be lost.')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  // ============ RENDER ============

  return (
    <div className={className}>
      {/* Colorful Modal Header */}
      <div className={`relative overflow-hidden rounded-t-lg ${mode === 'create' ? 'bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600' : 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600'} p-6 shadow-lg`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative flex items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg ${mode === 'create' ? 'bg-white bg-opacity-30 backdrop-blur-sm' : 'bg-white bg-opacity-30 backdrop-blur-sm'}`}>
            <span className="text-white text-2xl font-bold">{mode === 'create' ? '+' : '✎'}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              {mode === 'create' ? 'Create New User' : `Edit User: ${user?.name}`}
            </h2>
            <p className={`text-sm ${mode === 'create' ? 'text-green-100' : 'text-blue-100'} mt-1`}>
              {mode === 'create' ? 'Add a new user to the system' : 'Update user information'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 bg-white rounded-b-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username *
                {mode === 'edit' && (
                  <span className="text-xs text-gray-500 ml-1">(read-only)</span>
                )}
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isSubmitting || loading || mode === 'edit'}
                readOnly={mode === 'edit'}
                placeholder={mode === 'edit' ? 'Username cannot be changed' : 'Enter username'}
                autoComplete="username"
                className={`${errors.username ? 'border-red-300' : ''} ${
                  mode === 'edit' ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                }`}
              />
              {errors.username && (
                <div className="mt-1 text-sm text-red-600">
                  {errors.username.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting || loading}
                placeholder="Enter email address (optional)"
                autoComplete="email"
                className={errors.email ? 'border-red-300' : ''}
              />
              {errors.email && (
                <div className="mt-1 text-sm text-red-600">
                  {errors.email.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting || loading}
                placeholder="Enter full name"
                autoComplete="name"
                className={errors.name ? 'border-red-300' : ''}
              />
              {errors.name && (
                <div className="mt-1 text-sm text-red-600">
                  {errors.name.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Position */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <Input
                id="position"
                name="position"
                type="text"
                value={formData.position}
                onChange={handleInputChange}
                disabled={isSubmitting || loading}
                placeholder="Enter position"
                className={errors.position ? 'border-red-300' : ''}
              />
              {errors.position && (
                <div className="mt-1 text-sm text-red-600">
                  {errors.position.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={isSubmitting || loading}
                className={errors.role ? 'border-red-300' : ''}
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
                <option value="viewer">Viewer (Read-Only)</option>
              </Select>
              {errors.role && (
                <div className="mt-1 text-sm text-red-600">
                  {errors.role.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <Select
                id="is_active"
                name="is_active"
                value={formData.is_active.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                disabled={isSubmitting || loading}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>

          {/* Password Fields (Create mode) */}
          {mode === 'create' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isSubmitting || loading}
                  placeholder="Enter password"
                  autoComplete="new-password"
                  className={errors.password ? 'border-red-300' : ''}
                />
                {errors.password && (
                  <div className="mt-1 text-sm text-red-600">
                    {errors.password.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isSubmitting || loading}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className={errors.confirmPassword ? 'border-red-300' : ''}
                />
                {errors.confirmPassword && (
                  <div className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Empty div to maintain 3-column layout */}
              <div></div>
            </div>
          )}

          {/* Password Update Section (Edit mode) */}
          {mode === 'edit' && (
            <div className="pt-4 border-t border-gray-200">
              {/* Toggle Password Update */}
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updatePassword}
                    onChange={(e) => {
                      setUpdatePassword(e.target.checked);
                      if (!e.target.checked) {
                        // Clear password fields when unchecked
                        setFormData(prev => ({
                          ...prev,
                          password: '',
                          confirmPassword: ''
                        }));
                        // Clear password errors
                        setErrors(prev => ({
                          ...prev,
                          password: undefined,
                          confirmPassword: undefined
                        }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isSubmitting || loading}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Update Password
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Check this box if you want to change the user's password
                </p>
              </div>

              {/* Password Fields (shown when updatePassword is true) */}
              {updatePassword && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password *
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isSubmitting || loading}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      className={errors.password ? 'border-red-300' : ''}
                    />
                    {errors.password && (
                      <div className="mt-1 text-sm text-red-600">
                        {errors.password.map((error, index) => (
                          <div key={index}>{error}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password *
                    </label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isSubmitting || loading}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      className={errors.confirmPassword ? 'border-red-300' : ''}
                    />
                    {errors.confirmPassword && (
                      <div className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword.map((error, index) => (
                          <div key={index}>{error}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Password Requirements Info */}
                  <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-2">Password Requirements:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-1">•</span>
                        <span>At least 8 characters</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1">•</span>
                        <span>One uppercase letter</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1">•</span>
                        <span>One lowercase letter</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1">•</span>
                        <span>One number</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting || loading}
              className="px-6 py-2.5 rounded-lg font-semibold hover:shadow-md transition-all duration-200"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || loading}
              className={`px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                mode === 'create'
                  ? 'bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700'
                  : 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700'
              }`}
            >
              {isSubmitting || loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? '✓ Create User' : '✓ Update User'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormSection;

/*
=== USER FORM SECTION FEATURES ===

EMBEDDED DESIGN:
✅ Card-based layout for inline embedding
✅ Distinct visual styling for create vs edit modes
✅ Compact but accessible form layout
✅ Clear visual hierarchy and spacing

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained user form component
✅ No dependencies on other entity forms
✅ Reusable in different contexts
✅ Type-safe interfaces and props

COMPREHENSIVE VALIDATION:
✅ Real-time form validation
✅ Username format validation
✅ Email format validation
✅ Password strength requirements (create mode)
✅ Password confirmation matching
✅ Required field validation

USER EXPERIENCE:
✅ Auto-focus and keyboard navigation
✅ Loading states and disabled inputs
✅ Clear error messages with specific guidance
✅ Dirty state tracking with confirmation
✅ Responsive grid layout
✅ Professional styling with status indicators

FORM FUNCTIONALITY:
✅ Create and edit modes in single component
✅ Form state management and validation
✅ Error handling and display
✅ Async submission handling
✅ Form reset capabilities

MANUFACTURING CONTEXT:
✅ Role-based access control fields
✅ Position field for organizational structure
✅ Active/inactive status management
✅ Professional form styling
✅ Context-appropriate field labels
*/