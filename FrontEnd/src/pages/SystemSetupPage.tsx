// client/src/pages/SystemSetupPage.tsx
// System Setup Page - Simplified Configuration
// Complete Separation Entity Architecture - System Configuration Management

import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  ServerIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import sysconfigService, { type SystemSetupConfig } from '../services/sysconfigService';
import systemService, { type SystemStatus } from '../services/systemService';
import Toast, { useToast } from '../components/ui/Toast';
import { formatDateTime } from '../utils/formatUtils';
import { useAuth } from '../contexts/AuthContext';

// ==================== TYPE DEFINITIONS ====================

// Use the centralized type from sysconfigService
type Sysconfig = SystemSetupConfig;

// ==================== MAIN COMPONENT ====================

const SystemSetupPage: React.FC = () => {
  const [config, setConfig] = useState<Sysconfig | null>(null);
  const [editedConfig, setEditedConfig] = useState<Partial<Sysconfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showMssqlPassword, setShowMssqlPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [testEmail, setTestEmail] = useState('');

  // Server management state
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin' as any);
  const [serverStatus, setServerStatus] = useState<SystemStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [restartCountdown, setRestartCountdown] = useState<number | null>(null);

  // Load configuration on component mount
  useEffect(() => {
    loadConfig();
    if (isAdmin) {
      loadServerStatus();
      // Refresh server status every 30 seconds to keep uptime current
      const interval = setInterval(loadServerStatus, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await sysconfigService.getActiveSystemSetup();

      if (response.success && response.data) {
        // Normalize mssql_enabled to boolean (default true if null/undefined)
        const normalizedConfig = {
          ...response.data,
          mssql_enabled: response.data.mssql_enabled ?? true
        };
        setConfig(normalizedConfig);
        setEditedConfig(normalizedConfig);
      } else {
        throw new Error(response.message || 'Failed to load configuration');
      }
    } catch (error) {
      console.error('Load config error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const loadServerStatus = async () => {
    try {
      setLoadingStatus(true);
      const response = await systemService.getStatus();
      if (response.success && response.data) {
        setServerStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load server status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const handleRestartServer = async () => {
    if (!window.confirm('Are you sure you want to restart the server? All active connections will be temporarily interrupted.')) {
      return;
    }

    try {
      setRestarting(true);
      const response = await systemService.restartServer();
      if (response.success) {
        toast.success('Server restart initiated. Please wait...');
        // Start countdown
        setRestartCountdown(15);
        const interval = setInterval(() => {
          setRestartCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              setRestarting(false);
              setRestartCountdown(null);
              // Reload status after restart
              setTimeout(() => loadServerStatus(), 2000);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(response.message || 'Failed to restart server');
        setRestarting(false);
      }
    } catch (error) {
      toast.error('Failed to restart server');
      setRestarting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrors({});

      if (!config?.id) {
        throw new Error('No configuration ID found');
      }

      // Only send changed configuration fields
      const changedFields: Partial<Sysconfig> = {};

      // SMTP fields
      if (editedConfig.smtp_server !== config.smtp_server) {
        changedFields.smtp_server = editedConfig.smtp_server;
      }
      if (editedConfig.smtp_port !== config.smtp_port) {
        changedFields.smtp_port = editedConfig.smtp_port;
      }
      if (editedConfig.smtp_username !== config.smtp_username) {
        changedFields.smtp_username = editedConfig.smtp_username;
      }
      if (editedConfig.smtp_password !== config.smtp_password) {
        changedFields.smtp_password = editedConfig.smtp_password;
      }

      // MSSQL fields
      if (editedConfig.mssql_server !== config.mssql_server) {
        changedFields.mssql_server = editedConfig.mssql_server;
      }
      if (editedConfig.mssql_port !== config.mssql_port) {
        changedFields.mssql_port = editedConfig.mssql_port;
      }
      if (editedConfig.mssql_database !== config.mssql_database) {
        changedFields.mssql_database = editedConfig.mssql_database;
      }
      if (editedConfig.mssql_username !== config.mssql_username) {
        changedFields.mssql_username = editedConfig.mssql_username;
      }
      if (editedConfig.mssql_password !== config.mssql_password) {
        changedFields.mssql_password = editedConfig.mssql_password;
      }
      if (editedConfig.mssql_enabled !== config.mssql_enabled) {
        changedFields.mssql_enabled = editedConfig.mssql_enabled;
      }

      if (Object.keys(changedFields).length === 0) {
        toast.info('No changes to save');
        return;
      }

      const response = await sysconfigService.updateSystemSetup(config.id, changedFields);

      if (response.success && response.data) {
        // Normalize mssql_enabled to boolean
        const normalizedConfig = {
          ...response.data,
          mssql_enabled: response.data.mssql_enabled ?? true
        };
        setConfig(normalizedConfig);
        setEditedConfig(normalizedConfig);
        setIsEditing(false);
        toast.success('Configuration saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedConfig(config || {});
    setErrors({});
    setIsEditing(false);
  };

  const hasChanges = () => {
    if (!config) return false;
    return (
      editedConfig.smtp_server !== config.smtp_server ||
      editedConfig.smtp_port !== config.smtp_port ||
      editedConfig.smtp_username !== config.smtp_username ||
      editedConfig.smtp_password !== config.smtp_password ||
      editedConfig.mssql_server !== config.mssql_server ||
      editedConfig.mssql_port !== config.mssql_port ||
      editedConfig.mssql_database !== config.mssql_database ||
      editedConfig.mssql_username !== config.mssql_username ||
      editedConfig.mssql_password !== config.mssql_password ||
      editedConfig.mssql_enabled !== config.mssql_enabled
    );
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return 'N/A';
    return formatDateTime(date, 'N/A');
  };

  const handleTestMssqlConnection = async () => {
    try {
      setTestingConnection(true);
      setConnectionTestResult(null);
      setErrors({});

      const response = await sysconfigService.testMssqlConnection();

      console.log('Connection test result:', response);

      if (response.success) {
        setConnectionTestResult({
          success: true,
          message: response.message || 'Connection successful!'
        });
        setTimeout(() => setConnectionTestResult(null), 5000);
      } else {
        const errorMessage = response.message || 'Connection failed';
        console.error('Connection test failed:', errorMessage);
        setConnectionTestResult({
          success: false,
          message: errorMessage
        });
        setTimeout(() => setConnectionTestResult(null), 8000);
      }
    } catch (error) {
      console.error('Test connection error:', error);
      setConnectionTestResult({
        success: false,
        message: 'Network error. Please try again.'
      });
      setTimeout(() => setConnectionTestResult(null), 8000);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestSmtpConnection = async () => {
    try {
      setTestingEmail(true);
      setEmailTestResult(null);
      setErrors({});

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!testEmail || !emailRegex.test(testEmail)) {
        setEmailTestResult({
          success: false,
          message: 'Please enter a valid email address'
        });
        setTimeout(() => setEmailTestResult(null), 5000);
        setTestingEmail(false);
        return;
      }

      const response = await sysconfigService.testSmtpConnection(testEmail);

      console.log('Email test result:', response);

      if (response.success) {
        setEmailTestResult({
          success: true,
          message: response.message || `Test email sent successfully to ${testEmail}!`
        });
        setTimeout(() => setEmailTestResult(null), 8000);
      } else {
        const errorMessage = response.message || response.error || 'Failed to send test email';
        console.error('Email test failed:', errorMessage);
        setEmailTestResult({
          success: false,
          message: errorMessage
        });
        setTimeout(() => setEmailTestResult(null), 10000);
      }
    } catch (error) {
      console.error('Test email error:', error);
      setEmailTestResult({
        success: false,
        message: 'Network error. Please try again.'
      });
      setTimeout(() => setEmailTestResult(null), 8000);
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/10 to-yellow-50/10 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-orange-600" />
          <span className="text-gray-600">Loading system configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/10 to-yellow-50/10">
      {/* Toast Notifications */}
      {toast.toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          duration={t.duration}
          onClose={() => toast.removeToast(t.id)}
          position="top-right"
        />
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-md">
              <Cog6ToothIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                System Setup
              </h1>
              <p className="text-sm text-gray-600">System and email configuration</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{errors.general}</span>
          </div>
        )}

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Left Column - System Configuration */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-fit">
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <ServerIcon className="h-5 w-5 mr-2" />
                System Configuration
              </h2>
              <p className="text-orange-100 text-sm mt-1">Read-only system information</p>
            </div>
            <div className="p-6 space-y-4">
              {/* System Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Name
                </label>
                <input
                  type="text"
                  value={config?.system_name || 'N/A'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* System Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Version
                </label>
                <input
                  type="text"
                  value={config?.system_version || 'N/A'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* System Updated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Updated
                </label>
                <input
                  type="text"
                  value={formatDateDisplay(config?.system_updated || null)}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Info Notice */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  These fields are read-only and managed by the system administrator.
                </p>
              </div>

              {/* Server Management Section (Admin Only) */}
              {isAdmin && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                    Server Management
                  </h3>

                  {/* Server Status */}
                  {serverStatus && (
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Uptime</span>
                        <span className="font-medium text-gray-800">{formatUptime(serverStatus.uptime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory (RSS)</span>
                        <span className="font-medium text-gray-800">{serverStatus.memory.rss} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Node.js</span>
                        <span className="font-medium text-gray-800">{serverStatus.nodeVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Environment</span>
                        <span className="font-medium text-gray-800">{serverStatus.env}</span>
                      </div>
                    </div>
                  )}

                  {loadingStatus && !serverStatus && (
                    <p className="text-sm text-gray-500 mb-4">Loading server status...</p>
                  )}

                  {/* Restart Button */}
                  {restartCountdown !== null ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                      <ArrowPathIcon className="h-5 w-5 text-amber-600 mx-auto mb-1 animate-spin" />
                      <p className="text-sm text-amber-800 font-medium">
                        Server is restarting...
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Estimated ready in {restartCountdown}s
                      </p>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleRestartServer}
                        disabled={restarting}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${restarting ? 'animate-spin' : ''}`} />
                        {restarting ? 'Restarting...' : 'Restart Server'}
                      </button>
                      <button
                        onClick={loadServerStatus}
                        disabled={loadingStatus}
                        className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        title="Refresh status"
                      >
                        <ArrowPathIcon className={`h-4 w-4 ${loadingStatus ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    Restarts the backend service. Docker will automatically bring it back online.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Email Setup */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-fit">
            <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Email Setup
                  </h2>
                  <p className="text-orange-100 text-sm mt-1">SMTP server configuration</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white/90 hover:bg-white text-orange-700 rounded-lg font-medium transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* SMTP Server */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Server
                </label>
                <input
                  type="text"
                  value={editedConfig.smtp_server || ''}
                  onChange={(e) => setEditedConfig(prev => ({...prev, smtp_server: e.target.value}))}
                  disabled={!isEditing}
                  placeholder="smtp.example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              {/* SMTP Port */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={editedConfig.smtp_port || 587}
                  onChange={(e) => setEditedConfig(prev => ({...prev, smtp_port: parseInt(e.target.value) || 587}))}
                  disabled={!isEditing}
                  placeholder="587"
                  min="1"
                  max="65535"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">Common ports: 25, 465 (SSL), 587 (TLS), 2525</p>
              </div>

              {/* SMTP Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={editedConfig.smtp_username || ''}
                  onChange={(e) => setEditedConfig(prev => ({...prev, smtp_username: e.target.value}))}
                  disabled={!isEditing}
                  placeholder="username@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              {/* SMTP Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editedConfig.smtp_password || ''}
                    onChange={(e) => setEditedConfig(prev => ({...prev, smtp_password: e.target.value}))}
                    disabled={!isEditing}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all pr-10"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges()}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                  >
                    {saving ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Email Test Button and Input */}
              {!isEditing && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Email Address
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                    <button
                      onClick={handleTestSmtpConnection}
                      disabled={testingEmail || !testEmail}
                      className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      {testingEmail ? (
                        <>
                          <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <EnvelopeIcon className="h-5 w-5 mr-2" />
                          Send Test
                        </>
                      )}
                    </button>
                  </div>

                  {/* Email Test Result */}
                  {emailTestResult && (
                    <div className={`mt-3 p-4 rounded-lg border ${
                      emailTestResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {emailTestResult.success ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            emailTestResult.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {emailTestResult.success ? 'Success' : 'Failed'}
                          </p>
                          <p className={`text-sm mt-1 ${
                            emailTestResult.success ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {emailTestResult.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Help Text */}
              {!isEditing && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
                  <InformationCircleIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Email Configuration</p>
                    <p>Configure SMTP settings to enable email notifications for inspection alerts and reports. Use the test function to verify your settings.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Third Column - MSSQL Configuration */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-fit lg:col-span-2 xl:col-span-1">
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <ServerIcon className="h-5 w-5 mr-2" />
                    MSSQL Database
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">Source database configuration</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white/90 hover:bg-white text-blue-700 rounded-lg font-medium transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* MSSQL Sync Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    MSSQL Data Sync
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable or disable automatic data import from MSSQL database
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditedConfig(prev => ({...prev, mssql_enabled: !prev.mssql_enabled}))}
                  disabled={!isEditing}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    editedConfig.mssql_enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      editedConfig.mssql_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Status indicator */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                editedConfig.mssql_enabled
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  editedConfig.mssql_enabled ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className={`text-sm font-medium ${
                  editedConfig.mssql_enabled ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {editedConfig.mssql_enabled ? 'Sync Enabled' : 'Sync Disabled'}
                </span>
              </div>

              {/* MSSQL Server */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Server Host
                </label>
                <input
                  type="text"
                  value={editedConfig.mssql_server || ''}
                  onChange={(e) => setEditedConfig(prev => ({...prev, mssql_server: e.target.value}))}
                  disabled={!isEditing}
                  placeholder="localhost or 192.168.1.100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              {/* MSSQL Port */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  value={editedConfig.mssql_port || 1433}
                  onChange={(e) => setEditedConfig(prev => ({...prev, mssql_port: parseInt(e.target.value) || 1433}))}
                  disabled={!isEditing}
                  placeholder="1433"
                  min="1"
                  max="65535"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">Default MSSQL port: 1433</p>
              </div>

              {/* MSSQL Database */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Database Name
                </label>
                <input
                  type="text"
                  value={editedConfig.mssql_database || ''}
                  onChange={(e) => setEditedConfig(prev => ({...prev, mssql_database: e.target.value}))}
                  disabled={!isEditing}
                  placeholder="production_db"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              {/* MSSQL Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editedConfig.mssql_username || ''}
                  onChange={(e) => setEditedConfig(prev => ({...prev, mssql_username: e.target.value}))}
                  disabled={!isEditing}
                  placeholder="sa or database_user"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              {/* MSSQL Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showMssqlPassword ? 'text' : 'password'}
                    value={editedConfig.mssql_password || ''}
                    onChange={(e) => setEditedConfig(prev => ({...prev, mssql_password: e.target.value}))}
                    disabled={!isEditing}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all pr-10"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowMssqlPassword(!showMssqlPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showMssqlPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                  >
                    {saving ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Connection Test Button */}
              {!isEditing && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleTestMssqlConnection}
                    disabled={testingConnection}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    {testingConnection ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <ServerIcon className="h-5 w-5 mr-2" />
                        Test MSSQL Connection
                      </>
                    )}
                  </button>

                  {/* Connection Test Result */}
                  {connectionTestResult && (
                    <div className={`mt-3 p-4 rounded-lg border ${
                      connectionTestResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {connectionTestResult.success ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            connectionTestResult.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {connectionTestResult.success ? 'Success' : 'Failed'}
                          </p>
                          <p className={`text-sm mt-1 ${
                            connectionTestResult.success ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {connectionTestResult.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Help Text */}
              {!isEditing && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Database Configuration</p>
                    <p>Configure MSSQL connection to import data from the source database. Use the toggle to enable or disable automatic sync. Server restart is required for changes to take effect.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSetupPage;
