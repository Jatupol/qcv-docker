// client/src/components/users/UserInfoModal.tsx
// User Information Modal Component - Read-Only View
// Manufacturing Quality Control System
// Simplified: Navigation to dedicated pages for edit/password change

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  IdentificationIcon,
  BriefcaseIcon,
  ClockIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import {
  formatUserDate,
  formatUserTime,
  getRoleColorClasses,
  getShiftColorClasses
} from '../../utils/usersUtils';
import type { User } from '../../types/user';

// ==================== TYPES & INTERFACES ====================

export interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  showEditButton?: boolean;
  showPasswordButton?: boolean;
  allowRoleDisplay?: boolean;
  compactMode?: boolean;
}

// ==================== USER INFO MODAL COMPONENT ====================

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  isOpen,
  onClose,
  user,
  showEditButton = true,
  showPasswordButton = true,
  allowRoleDisplay = true,
  compactMode = false
}) => {
  const navigate = useNavigate();

  // Don't render if modal is not open or no user provided
  if (!isOpen || !user) {
    return null;
  }

  // ==================== EVENT HANDLERS ====================

  const handleEditProfile = () => {
    onClose();
    navigate('/profile/edit');
  };

  const handleChangePassword = () => {
    onClose();
    navigate('/profile/password');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <ShieldCheckIcon className="w-4 h-4" />;
      case 'manager':
        return <BriefcaseIcon className="w-4 h-4" />;
      case 'user':
        return <UserIcon className="w-4 h-4" />;
      case 'viewer':
        return <UserCircleIcon className="w-4 h-4" />;
      default:
        return <UserCircleIcon className="w-4 h-4" />;
    }
  };

  // ==================== RENDER ====================

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl ${
          compactMode ? 'w-full max-w-xl max-h-[80vh]' : 'w-full max-w-2xl max-h-[90vh]'
        } overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-blue-100">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: compactMode ? '60vh' : '70vh' }}>
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-500" />
                Basic Information
              </h3>
              <div className="space-y-4">
                {/* Row 1: Full Name + Username */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">
                        Full Name
                      </label>
                      <span className="text-gray-900 font-bold text-lg">{user.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 shadow-sm">
                    <IdentificationIcon className="w-6 h-6 text-gray-600" />
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                        Username
                      </label>
                      <span className="text-gray-900 font-bold">{user.username}</span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Email + User ID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 shadow-sm">
                    <EnvelopeIcon className="w-6 h-6 text-purple-600" />
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-purple-700 uppercase tracking-wide mb-1">
                        Email Address
                      </label>
                      <span className="text-gray-900 font-bold break-all">{user.email || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 shadow-sm">
                    <IdentificationIcon className="w-6 h-6 text-gray-600" />
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                        User ID
                      </label>
                      <span className="text-gray-900 font-bold font-mono">#{user.id}</span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Role + Status + Position */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {allowRoleDisplay && (
                    <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200 shadow-sm">
                      <label className="block text-xs font-bold text-red-700 uppercase tracking-wide mb-3">
                        Role
                      </label>
                      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold border shadow-sm ${getRoleColorClasses(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm">
                    <label className="block text-xs font-bold text-green-700 uppercase tracking-wide mb-3">
                      Status
                    </label>
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                      user.is_active
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {user.is_active ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : (
                        <XCircleIcon className="w-5 h-5" />
                      )}
                      <span>{user.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200 shadow-sm">
                    <label className="block text-xs font-bold text-orange-700 uppercase tracking-wide mb-3">
                      Position
                    </label>
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold bg-orange-100 text-orange-800 border border-orange-300 shadow-sm">
                      <BriefcaseIcon className="w-5 h-5" />
                      <span>{user.position || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BriefcaseIcon className="w-5 h-5 mr-2 text-green-500" />
                Work Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Work Shift */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4 shadow-sm">
                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wide mb-3 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Work Shift
                    </label>
                    {user.work_shift ? (
                      <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold shadow-md ${getShiftColorClasses(user.work_shift)}`}>
                        <ClockIcon className="w-5 h-5 mr-2" />
                        Shift {user.work_shift}
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-500 border border-gray-300">
                        <ClockIcon className="w-5 h-5 mr-2" />
                        Not assigned
                      </div>
                    )}
                  </div>

                  {/* FVI Line */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-4 shadow-sm">
                    <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wide mb-3 flex items-center">
                      <ClipboardDocumentListIcon className="w-4 h-4 mr-1" />
                      FVI Line
                    </label>
                    {user.linevi ? (
                      <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border border-indigo-300 shadow-md">
                        <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                        Line {user.linevi}
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-500 border border-gray-300">
                        <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                        Not assigned
                      </div>
                    )}
                  </div>

                  {/* Team */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border-2 border-teal-200 p-4 shadow-sm">
                    <label className="block text-xs font-bold text-teal-700 uppercase tracking-wide mb-3 flex items-center">
                      <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                      Team
                    </label>
                    {user.team ? (
                      <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border border-teal-300 shadow-md">
                        <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                        {user.team}
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-500 border border-gray-300">
                        <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                        Not assigned
                      </div>
                    )}
                  </div>
                </div>

                {/* Work Hours */}
                {(user.time_start_work || user.time_off_work) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.time_start_work && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <ClockIcon className="w-5 h-5 text-green-500" />
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Start Time
                          </label>
                          <span className="text-gray-900 font-medium">{formatUserTime(user.time_start_work)}</span>
                        </div>
                      </div>
                    )}

                    {user.time_off_work && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <ClockIcon className="w-5 h-5 text-red-500" />
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            End Time
                          </label>
                          <span className="text-gray-900 font-medium">{formatUserTime(user.time_off_work)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Last Check-in */}
                {user.checkin && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <CalendarIcon className="w-5 h-5 text-blue-500" />
                    <div>
                      <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">
                        Last Check-in
                      </label>
                      <span className="text-blue-900 font-medium">{formatUserDate(user.checkin)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Account Status: {user.is_active ? (
              <span className="text-green-600 font-medium">Active</span>
            ) : (
              <span className="text-red-600 font-medium">Inactive</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {showPasswordButton && (
              <button
                type="button"
                onClick={handleChangePassword}
                className="px-4 py-2 text-sm font-medium text-orange-700 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-lg hover:bg-orange-200 transition-colors flex items-center space-x-1 shadow-sm"
              >
                <KeyIcon className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            )}

            {showEditButton && (
              <button
                type="button"
                onClick={handleEditProfile}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1 shadow-sm"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
