// client/src/pages/masterdata/InspectionDataSetupPage.tsx
// Inspection Data Setup Page - Simplified Configuration
// Complete Separation Entity Architecture - Inspection Configuration Management

import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  SwatchIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import type { InspectionConfig, ArrayValueManagerProps } from '../../types/sysconfig';
import { inspectionDataSetupService } from '../../services/inspectionDataSetupService';
import { soundNotification } from '../../utils/soundNotification';

// ==================== UTILITY COMPONENTS ====================

const ArrayValueManager: React.FC<ArrayValueManagerProps> = ({
  values,
  onChange,
  type,
  placeholder,
  maxItems = 20,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');

  const addValue = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    if (type === 'numeric') {
      const numValue = parseFloat(trimmedValue);
      if (isNaN(numValue)) return;
      if (values.includes(numValue.toString())) return;
    } else {
      if (values.includes(trimmedValue)) return;
    }

    if (values.length >= maxItems) return;

    onChange([...values, trimmedValue]);
    setInputValue('');
  };

  const removeValue = (valueToRemove: string) => {
    onChange(values.filter(v => v !== valueToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input Section */}
      <div className="flex gap-2">
        <input
          type={type === 'numeric' ? 'number' : 'text'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
        />
        <button
          type="button"
          onClick={addValue}
          disabled={disabled || !inputValue.trim() || values.length >= maxItems}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Values List */}
      {values.length > 0 && (
        <div className="border border-orange-200 rounded-lg p-4 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
          <div className="flex flex-wrap gap-2">
            {values.map((value, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-white border border-orange-200 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-sm font-medium text-gray-700">{value}</span>
                <button
                  type="button"
                  onClick={() => removeValue(value)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-600 font-medium">
            {values.length} / {maxItems} items
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const InspectionDataSetupPage: React.FC = () => {
  const [config, setConfig] = useState<InspectionConfig | null>(null);
  const [editedConfig, setEditedConfig] = useState<Partial<InspectionConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'sampling' | 'organization' | 'defect' | 'email'>('sampling');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setErrors({});

      const loadedConfig = await inspectionDataSetupService.loadActiveConfig();

      if (loadedConfig) {
        setConfig(loadedConfig);
        setEditedConfig(loadedConfig);
      } else {
        throw new Error('No active configuration found');
      }
    } catch (error) {
      console.error('Load config error:', error);
      soundNotification.play('error');
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to load configuration. Please check if there is an active system configuration.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrors({});

      console.log('🔍 Save initiated - Config:', config);
      console.log('🔍 Save initiated - EditedConfig:', editedConfig);

      if (!config?.id || !editedConfig.id) {
        throw new Error('No configuration ID found');
      }

      // Check for changes
      const changes = inspectionDataSetupService.detectChanges(config, editedConfig as InspectionConfig);
      console.log('🔍 Changes detected:', changes);

      if (!changes.hasChanges) {
        setSuccessMessage('No changes to save');
        soundNotification.play('info');
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }

      console.log('💾 Saving configuration with changes to fields:', changes.modifiedFields);

      // Save configuration
      const result = await inspectionDataSetupService.saveConfig(editedConfig as InspectionConfig);
      console.log('📥 Save result:', result);

      if (result.success) {
        // Play success sound
        soundNotification.play('success');

        // Reload to get updated data
        const updatedConfig = await inspectionDataSetupService.loadActiveConfig();
        if (updatedConfig) {
          setConfig(updatedConfig);
          setEditedConfig(updatedConfig);
        }
        setIsEditing(false);
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Save error:', error);

      // Play error sound
      soundNotification.play('error');

      setErrors({
        general: error instanceof Error ? error.message : 'Failed to save configuration'
      });
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
    const changes = inspectionDataSetupService.detectChanges(config, editedConfig as InspectionConfig);
    return changes.hasChanges;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/10 to-yellow-50/10 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-orange-600" />
          <span className="text-gray-600">Loading inspection configuration...</span>
        </div>
      </div>
    );
  }

  // Show error state when no config is loaded
  if (!loading && !config && errors.general) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/10 to-yellow-50/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-md">
                <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  Inspection Data Setup
                </h1>
                <p className="text-sm text-gray-600">Configure inspection parameters and options</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Configuration Not Found</h2>
              <p className="text-gray-600 text-center max-w-md">
                {errors.general}
              </p>
              <button
                onClick={loadConfig}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all duration-200 flex items-center shadow-md hover:shadow-lg font-medium"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/10 to-yellow-50/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-md">
                <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  Inspection Data Setup
                </h1>
                <p className="text-sm text-gray-600">Configure inspection parameters and options</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all duration-200 flex items-center shadow-md hover:shadow-lg font-medium"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Configuration
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center font-medium shadow-sm"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges()}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-md hover:shadow-lg font-medium"
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3 shadow-sm">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 shadow-sm">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">{errors.general}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-t-xl shadow-lg border border-gray-200 border-b-0">
          <div className="flex space-x-2 p-3">
            <button
              onClick={() => setActiveTab('sampling')}
              className={`flex-1 flex items-center justify-center px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'sampling'
                  ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-lg shadow-orange-300/50'
                  : 'bg-gradient-to-br from-orange-50 to-amber-50 text-orange-700 hover:from-orange-100 hover:to-amber-100 border border-orange-200'
              }`}
            >
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Sampling Quantities
            </button>
            <button
              onClick={() => setActiveTab('organization')}
              className={`flex-1 flex items-center justify-center px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'organization'
                  ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-300/50'
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 border border-blue-200'
              }`}
            >
              <BuildingOfficeIcon className="h-5 w-5 mr-2" />
              Organization Data
            </button>
            <button
              onClick={() => setActiveTab('defect')}
              className={`flex-1 flex items-center justify-center px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'defect'
                  ? 'bg-gradient-to-br from-red-500 via-red-600 to-rose-600 text-white shadow-lg shadow-red-300/50'
                  : 'bg-gradient-to-br from-red-50 to-rose-50 text-red-700 hover:from-red-100 hover:to-rose-100 border border-red-200'
              }`}
            >
              <SwatchIcon className="h-5 w-5 mr-2" />
              Defect Configuration
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 flex items-center justify-center px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'email'
                  ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-300/50'
                  : 'bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-700 hover:from-purple-100 hover:to-indigo-100 border border-purple-200'
              }`}
            >
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Email Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-lg border border-gray-200">
          {/* Tab 1: Sampling Quantities */}
          {activeTab === 'sampling' && (
            <div className="p-8 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30">
              <div className="mb-6 pb-4 border-b-2 border-orange-200">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg mr-3 shadow-md">
                    <Cog6ToothIcon className="h-6 w-6 text-white" />
                  </div>
                  Sampling Quantities
                </h2>
                <p className="text-sm text-gray-600 mt-2 ml-14">Configure lot and sampling quantity parameters</p>
              </div>
              <div className="space-y-6">
              {/* FVI Lot Quantity */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-orange-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  FVI Lot Quantity
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.fvi_lot_qty || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, fvi_lot_qty: values.join(',')}))}
                  type="numeric"
                  placeholder="e.g., 2400"
                  maxItems={10}
                  disabled={!isEditing}
                />
              </div>

              {/* General OQA Quantity */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-orange-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  General OQA Quantity
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.general_oqa_qty || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, general_oqa_qty: values.join(',')}))}
                  type="numeric"
                  placeholder="e.g., 78"
                  maxItems={10}
                  disabled={!isEditing}
                />
              </div>

              {/* Crack OQA Quantity */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-orange-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Crack OQA Quantity
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.crack_oqa_qty || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, crack_oqa_qty: values.join(',')}))}
                  type="numeric"
                  placeholder="e.g., 80"
                  maxItems={10}
                  disabled={!isEditing}
                />
              </div>

              {/* General SIV Quantity */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-orange-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  General SIV Quantity
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.general_siv_qty || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, general_siv_qty: values.join(',')}))}
                  type="numeric"
                  placeholder="e.g., 32"
                  maxItems={10}
                  disabled={!isEditing}
                />
              </div>

              {/* Crack SIV Quantity */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-orange-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Crack SIV Quantity
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.crack_siv_qty || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, crack_siv_qty: values.join(',')}))}
                  type="numeric"
                  placeholder="e.g., 60"
                  maxItems={10}
                  disabled={!isEditing}
                />
              </div>
              </div>
            </div>
          )}

          {/* Tab 2: Organization Data */}
          {activeTab === 'organization' && (
            <div className="p-8 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30">
              <div className="mb-6 pb-4 border-b-2 border-blue-200">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg mr-3 shadow-md">
                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                  </div>
                  Organization Data
                </h2>
                <p className="text-sm text-gray-600 mt-2 ml-14">Configure sites, shifts, and product information</p>
              </div>
              <div className="space-y-6">
              {/* Shift */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-blue-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Shift
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.shift || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, shift: values.join(',')}))}
                  type="text"
                  placeholder="e.g., A, B, Day"
                  maxItems={10}
                  disabled={!isEditing}
                />
              </div>

              {/* Site */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-blue-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Site
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.site || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, site: values.join(',')}))}
                  type="text"
                  placeholder="e.g., TNHK, JNHK"
                  maxItems={15}
                  disabled={!isEditing}
                />
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-blue-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Tabs
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.tabs || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, tabs: values.join(',')}))}
                  type="text"
                  placeholder="e.g., 1, 2, 3"
                  maxItems={10}
                  disabled={!isEditing}
                />
              </div>

              {/* Product Type */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-blue-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Product Type
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.product_type || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, product_type: values.join(',')}))}
                  type="text"
                  placeholder="e.g., SSA, DSA"
                  maxItems={15}
                  disabled={!isEditing}
                />
              </div>

              {/* Product Families */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-blue-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Product Families
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.product_families || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, product_families: values.join(',')}))}
                  type="text"
                  placeholder="e.g., Iris, Pine"
                  maxItems={100}
                  disabled={!isEditing}
                />
              </div>
              </div>
            </div>
          )}

          {/* Tab 3: Defect Configuration */}
          {activeTab === 'defect' && (
            <div className="p-8 bg-gradient-to-br from-red-50/30 via-white to-rose-50/30">
              <div className="mb-6 pb-4 border-b-2 border-red-200">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg mr-3 shadow-md">
                    <SwatchIcon className="h-6 w-6 text-white" />
                  </div>
                  Defect Configuration
                </h2>
                <p className="text-sm text-gray-600 mt-2 ml-14">Configure defect types, groups, and colors</p>
              </div>
              <div className="space-y-6">
              {/* Defect Type */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-red-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-red-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Defect Type
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.defect_type || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, defect_type: values.join(',')}))}
                  type="text"
                  placeholder="e.g., Normal defect"
                  maxItems={20}
                  disabled={!isEditing}
                />
              </div>

              {/* Defect Group */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-red-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-red-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Defect Group
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.defect_group || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, defect_group: values.join(',')}))}
                  type="text"
                  placeholder="e.g., Cosmetic, Functional"
                  maxItems={100}
                  disabled={!isEditing}
                />
              </div>

              {/* Defect Color */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-red-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-red-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Defect Color
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.defect_color || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, defect_color: values.join(',')}))}
                  type="text"
                  placeholder="e.g., Red, Yellow"
                  maxItems={100}
                  disabled={!isEditing}
                />
              </div>
              </div>
            </div>
          )}

          {/* Tab 4: Email Notification Settings */}
          {activeTab === 'email' && (
            <div className="p-8 bg-gradient-to-br from-purple-50/30 via-white to-indigo-50/30">
              <div className="mb-6 pb-4 border-b-2 border-purple-200">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg mr-3 shadow-md">
                    <EnvelopeIcon className="h-6 w-6 text-white" />
                  </div>
                  Email Notification Settings
                </h2>
                <p className="text-sm text-gray-600 mt-2 ml-14">Configure defect notification email recipients</p>
              </div>
              <div className="space-y-6">
              {/* Email List */}
              <div className="bg-white rounded-xl p-5 border-l-4 border-purple-400 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-bold text-purple-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Recipient Email Addresses
                  <span className="text-xs text-purple-500 font-normal ml-2">(Comma-separated list)</span>
                </label>
                <ArrayValueManager
                  values={inspectionDataSetupService.parseArrayField(editedConfig.defect_notification_emails || '')}
                  onChange={(values) => setEditedConfig(prev => ({...prev, defect_notification_emails: values.join(',')}))}
                  type="text"
                  placeholder="e.g., user@example.com"
                  maxItems={50}
                  disabled={!isEditing}
                />
                <p className="text-xs text-purple-600 mt-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
                  Add email addresses that should receive defect notifications. Emails will be sent when defects are created or updated.
                </p>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionDataSetupPage;

/*
=== INSPECTION DATA SETUP PAGE FEATURES ===

CONFIGURATION MANAGEMENT:
✅ Load active system configuration
✅ Edit configuration with validation
✅ Save changes with change detection
✅ Cancel editing with reset

UI COMPONENTS:
✅ ArrayValueManager for comma-separated values
✅ Tab layout with 4 sections (Sampling, Organization, Defect, Email)
✅ Sampling quantities management
✅ Organization data management
✅ Defect configuration management
✅ Email notification settings

USER EXPERIENCE:
✅ Loading states with spinners
✅ Success/error message displays
✅ Edit mode toggle
✅ Change detection (enable/disable save button)
✅ Automatic message dismissal
✅ Tab navigation for better organization
✅ Color-coded tabs for each section

ARCHITECTURE:
✅ Complete Separation Entity Architecture
✅ Type safety with dedicated types file
✅ Service layer for business logic
✅ Clean component separation
✅ Reusable utility components

CODE IMPROVEMENTS:
✅ Modern tab-based layout for better UX
✅ Better type safety with imported types
✅ Centralized business logic in service
✅ Cleaner component code
✅ Better maintainability
✅ Improved visual hierarchy
*/
