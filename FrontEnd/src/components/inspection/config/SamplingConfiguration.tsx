// client/src/components/inspection/config/SamplingConfiguration.tsx
// Main Sampling Configuration Component - UPDATED WITH HEROICONS
// Complete Separation Entity Architecture - Integrates with SysConfig for options

import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import {
  Cog6ToothIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  type SamplingConfigData,
  type SamplingConfigProps,
  type SysConfig,
  type  SamplingConfigState,
  DEFAULT_SAMPLING_CONFIG,
  getFieldOptions,
  validateSamplingConfig,
  parseSysConfig,
  calculateSamplingRatio,
  calculateCrackRatio
} from '../../../types/sysconfig';
import { sysconfigService } from '../../../services/sysconfigService';
import SamplingField from './SamplingField';

/**
 * Main Sampling Configuration Component
 * Complete Separation Entity Architecture - Integrates with SysConfig for options
 * Optimized with React.memo, useCallback, and useMemo
 */

const SamplingConfiguration: React.FC<SamplingConfigProps> = memo(({
  config,
  sysConfig: initialSysConfig,
  onChange,
  disabled = false,
  className = '',
  layout = 'grid',
  showLabels = true,
  showCustomInput = true,
  allowRoundSelection = true,
  maxRounds = 10,
  station = 'OQA', // Default to OQA if not specified
  disableFviLotQty = false, // Disable FVI Lot Quantity field
  disableGeneralSamplingQty = false, // Disable General Sampling Qty field
  disableCrackSamplingQty = false // Disable Crack Sampling Qty field
}) => {
  const [state, setState] = useState<SamplingConfigState>({
    config,
    sysConfig: initialSysConfig,
    loading: !initialSysConfig,
    error: null,
    showCustomInputs: {
      fviLotQty: false,
      generalSamplingQty: false,
      crackSamplingQty: false
    },
    validation: validateSamplingConfig(config)
  });

  // Load system configuration if not provided
  useEffect(() => {
    if (!state.sysConfig && !state.loading) {
      loadSysConfig();
    }
  }, []);

  // Update validation when config changes
  useEffect(() => {
    const validation = validateSamplingConfig(config);
    setState(prev => ({
      ...prev,
      config,
      validation
    }));
  }, [config]);

  const loadSysConfig = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Use sysconfigService which already has proper error handling
      const sysconfig = await sysconfigService.getSysconfig();

      // Convert Sysconfig to SysConfig format (they're compatible)
      const sysConfig: SysConfig = {
        id: sysconfig.id,
        fvi_lot_qty: sysconfig.fvi_lot_qty,
        general_oqa_qty: sysconfig.general_oqa_qty,
        crack_oqa_qty: sysconfig.crack_oqa_qty,
        general_siv_qty: sysconfig.general_siv_qty,  // Updated field name
        crack_siv_qty: sysconfig.crack_siv_qty,      // Updated field name
        defect_type: sysconfig.defect_type,
        shift: sysconfig.shift,
        site: sysconfig.site,
        grps: sysconfig.grps,
        zones: sysconfig.zones,
        systemversion: sysconfig.systemversion,
        systemupdated: sysconfig.systemupdated,
        created_at: new Date(),
        updated_at: new Date()
      };

      setState(prev => ({
        ...prev,
        sysConfig: sysConfig,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to load sysconfig:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load system configuration',
        loading: false
      }));
    }
  };

  const handleFieldChange = useCallback((field: keyof SamplingConfigData, value: number) => {
    const newConfig = { ...config, [field]: value };
    onChange(newConfig);
  }, [config, onChange]);

  const handleRetry = useCallback(() => {
    loadSysConfig();
  }, []);

  // Get layout classes - Memoized
  const layoutClasses = useMemo(() => {
    switch (layout) {
      case 'grid':
        return 'grid grid-cols-1 lg:grid-cols-3 gap-6';
      default:
        return 'grid grid-cols-1 lg:grid-cols-3 gap-6';
    }
  }, [layout]);

  // Memoize field options to prevent recalculation
  const fieldOptions = useMemo(() => {
    if (!state.sysConfig) return null;
    return {
      fviLotQty: getFieldOptions(state.sysConfig, 'fviLotQty'),
      generalSamplingQty: getFieldOptions(state.sysConfig, 'generalSamplingQty', station),
      crackSamplingQty: getFieldOptions(state.sysConfig, 'crackSamplingQty', station)
    };
  }, [state.sysConfig, station]);

  // Loading state
  if (state.loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <ArrowPathIcon className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error && !state.sysConfig) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{state.error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Component Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Cog6ToothIcon className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Sampling Configuration
            </h2>
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center space-x-3">
            {state.error && (
              <div className="flex items-center space-x-2 text-amber-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span className="text-sm">Fallback mode</span>
              </div>
            )}
            
            {state.validation.isValid && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="text-sm">Valid configuration</span>
              </div>
            )}
            
            {!state.validation.isValid && (
              <div className="flex items-center space-x-2 text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span className="text-sm">Configuration errors</span>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Fields */}
        <div className={layoutClasses}>
          
          {/* FVI Lot Quantity */}
          <SamplingField
            label={showLabels ? "FVI Lot Quantity" : undefined}
            value={config.fviLotQty}
            options={getFieldOptions(state.sysConfig, 'fviLotQty', station)}
            onChange={(value) => handleFieldChange('fviLotQty', value)}
            disabled={disabled || disableFviLotQty}
            showCustomInput={showCustomInput}
            fieldType="fviLotQty"
            min={1}
            max={10000}
            placeholder="Enter FVI lot quantity..."
            helperText="Total quantity in the FVI lot"
            required={true}
            configContext={config}
          />

          {/* General Sampling Quantity */}
          <SamplingField
            label={showLabels ? "General Sampling Qty" : undefined}
            value={config.generalSamplingQty}
            options={getFieldOptions(state.sysConfig, 'generalSamplingQty', station)}
            onChange={(value) => handleFieldChange('generalSamplingQty', value)}
            disabled={disabled || disableGeneralSamplingQty}
            showCustomInput={showCustomInput}
            fieldType="generalSamplingQty"
            min={1}
            max={1000}
            placeholder="Enter general sampling quantity..."
            helperText="Standard inspection sampling quantity"
            required={true}
            configContext={config}
          />

          {/* Crack Sampling Quantity */}
          <SamplingField
            label={showLabels ? "Crack Sampling Qty" : undefined}
            value={config.crackSamplingQty}
            options={getFieldOptions(state.sysConfig, 'crackSamplingQty', station)}
            onChange={(value) => handleFieldChange('crackSamplingQty', value)}
            disabled={disabled || disableCrackSamplingQty}
            showCustomInput={showCustomInput}
            fieldType="crackSamplingQty"
            min={1}
            max={100}
            placeholder="Enter crack sampling quantity..."
            helperText="Crack inspection sampling quantity"
            required={true}
            configContext={config}
          />

        </div>

        {/* Validation Messages */}
        {state.validation.errors.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Configuration Errors</h4>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {state.validation.errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {state.validation.warnings.length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">Configuration Warnings</h4>
                <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
                  {state.validation.warnings.map((warning, index) => (
                    <li key={index}>{warning.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

 
      </div>
    </div>
  );
});

SamplingConfiguration.displayName = 'SamplingConfiguration';

export default SamplingConfiguration;