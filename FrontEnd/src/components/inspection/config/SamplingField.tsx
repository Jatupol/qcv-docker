// client/src/components/inspection/config/SamplingField.tsx
// Sampling Field Component - UPDATED WITH HEROICONS
// Complete Separation Entity Architecture - Individual field component for sampling configuration

import React, { useState } from 'react';
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  CalculatorIcon, 
  CubeIcon, 
  ChartBarIcon, 
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { type SamplingFieldProps, type CustomInputProps, SAMPLING_FIELD_LIMITS } from '../../../types/sysconfig';

/**
 * Custom Input Component for Sampling Fields
 */
const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 999999,
  step = 1,
  placeholder = "Enter value...",
  disabled = false,
  className = "",
  onSave,
  onCancel
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const numValue = parseInt(inputValue);
    
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (numValue < min) {
      setError(`Value must be at least ${min}`);
      return;
    }
    
    if (numValue > max) {
      setError(`Value cannot exceed ${max.toLocaleString()}`);
      return;
    }

    onChange(numValue);
    setIsEditing(false);
    setError(null);
    onSave?.();
  };

  const handleCancel = () => {
    setInputValue(value.toString());
    setIsEditing(false);
    setError(null);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleEdit = () => {
    setInputValue(value.toString());
    setIsEditing(true);
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        {isEditing ? (
          <>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              min={min}
              max={max}
              step={step}
              placeholder={placeholder}
              disabled={disabled}
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                error ? 'border-red-300 bg-red-50' : 'border-orange-300'
              }`}
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="Save"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title="Cancel"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono flex items-center justify-between">
              <span>{(value ?? 0).toLocaleString()}</span>
              <button
                onClick={handleEdit}
                disabled={disabled}
                className="p-1 text-gray-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit custom value"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-xs">
          <ExclamationTriangleIcon className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Get icon for field type
 */
const getFieldIcon = (fieldType: SamplingFieldProps['fieldType']) => {
  switch (fieldType) {
    case 'fviLotQty':
      return CubeIcon;
    case 'generalSamplingQty':
      return ChartBarIcon;
    case 'crackSamplingQty':
      return ExclamationTriangleIcon;
    case 'round':
      return ArrowPathIcon;
    default:
      return CalculatorIcon;
  }
};

/**
 * Main Sampling Field Component
 */
const SamplingField: React.FC<SamplingFieldProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  showCustomInput = true,
  min,
  max,
  step = 1,
  placeholder,
  helperText,
  required = false,
  fieldType,
  configContext
}) => {
  const [showCustom, setShowCustom] = useState(false);
  
  const IconComponent = getFieldIcon(fieldType);
  const fieldLimits = SAMPLING_FIELD_LIMITS[fieldType];
  const effectiveMin = min ?? fieldLimits.min;
  const effectiveMax = max ?? fieldLimits.max;
  const effectiveStep = step ?? fieldLimits.step;

  const handleOptionClick = (optionValue: string) => {
    if (optionValue === 'custom') {
      setShowCustom(true);
    } else {
      const numValue = parseInt(optionValue);
      if (!isNaN(numValue)) {
        onChange(numValue);
        setShowCustom(false);
      }
    }
  };

  const handleCustomChange = (customValue: number) => {
    onChange(customValue);
  };

  // Get theme colors based on field type
  const getFieldTheme = (fieldType: SamplingFieldProps['fieldType']) => {
    switch (fieldType) {
      case 'fviLotQty':
        return {
          bg: 'from-purple-50 to-pink-50',
          border: 'border-purple-200',
          selectedBg: 'bg-purple-600',
          selectedText: 'text-white',
          unselectedBg: 'bg-white',
          unselectedText: 'text-purple-600',
          unselectedBorder: 'border-purple-200',
          unselectedHover: 'hover:bg-purple-50',
          icon: 'text-purple-600',
          display: 'text-purple-600'
        };
      case 'generalSamplingQty':
        return {
          bg: 'from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          selectedBg: 'bg-blue-600',
          selectedText: 'text-white',
          unselectedBg: 'bg-white',
          unselectedText: 'text-blue-600',
          unselectedBorder: 'border-blue-200',
          unselectedHover: 'hover:bg-blue-50',
          icon: 'text-blue-600',
          display: 'text-blue-600'
        };
      case 'crackSamplingQty':
        return {
          bg: 'from-teal-50 to-cyan-50',
          border: 'border-teal-200',
          selectedBg: 'bg-teal-600',
          selectedText: 'text-white',
          unselectedBg: 'bg-white',
          unselectedText: 'text-teal-600',
          unselectedBorder: 'border-teal-200',
          unselectedHover: 'hover:bg-teal-50',
          icon: 'text-teal-600',
          display: 'text-teal-600'
        };
      default:
        return {
          bg: 'from-gray-50 to-orange-50',
          border: 'border-orange-200',
          selectedBg: 'bg-orange-600',
          selectedText: 'text-white',
          unselectedBg: 'bg-white',
          unselectedText: 'text-orange-600',
          unselectedBorder: 'border-orange-200',
          unselectedHover: 'hover:bg-orange-50',
          icon: 'text-orange-600',
          display: 'text-orange-600'
        };
    }
  };

  const theme = getFieldTheme(fieldType);

  // Calculate ratio display for specific field types
  const getRatioDisplay = () => {
    if (!configContext) return null;

    switch (fieldType) {
      case 'generalSamplingQty':
        if (configContext.fviLotQty > 0) {
          const ratio = (value / configContext.fviLotQty * 100).toFixed(2);
          return `${ratio}% of FVI Lot`;
        }
        break;
      case 'crackSamplingQty':
        if (configContext.generalSamplingQty > 0) {
          const ratio = (value / configContext.generalSamplingQty * 100).toFixed(2);
          return `${ratio}% of General`;
        }
        break;
    }
    return null;
  };

  return (
    <div className={`bg-gradient-to-br ${theme.bg} rounded-xl border ${theme.border} p-6`}>
      {/* Field Header */}
      {label && (
        <div className="flex items-center space-x-3 mb-4">
          <IconComponent className={`h-6 w-6 ${theme.icon}`} />
          <h3 className={`text-lg font-bold ${theme.icon.replace('text-', 'text-').replace('-600', '-800')}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-4">
        {/* Button Grid */}
        <div className="grid grid-cols-4 gap-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option.toString())}
              disabled={disabled}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                value === option && !showCustom
                  ? `${theme.selectedBg} ${theme.selectedText} shadow-lg`
                  : `${theme.unselectedBg} ${theme.unselectedText} border ${theme.unselectedBorder} ${theme.unselectedHover}`
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {(option ?? 0).toLocaleString()}
            </button>
          ))}

          {showCustomInput && (
            <button
              onClick={() => handleOptionClick('custom')}
              disabled={disabled}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                showCustom
                  ? `${theme.selectedBg} ${theme.selectedText} shadow-lg`
                  : `${theme.unselectedBg} ${theme.unselectedText} border ${theme.unselectedBorder} ${theme.unselectedHover}`
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Custom
            </button>
          )}
        </div>

        {/* Custom Input */}
        {showCustom && showCustomInput && (
          <div className={`bg-white rounded-lg p-3 border ${theme.border}`}>
            <label className="block text-xs font-semibold text-gray-800 mb-2">Custom Quantity</label>
            <div className="flex space-x-2">
              <input
                type="number"
                min={effectiveMin}
                max={effectiveMax}
                step={effectiveStep}
                value={value}
                onChange={(e) => {
                  const numValue = parseInt(e.target.value);
                  if (!isNaN(numValue)) {
                    handleCustomChange(numValue);
                  }
                }}
                placeholder={placeholder || "Enter..."}
                disabled={disabled}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={() => setShowCustom(false)}
                disabled={disabled}
                className={`${theme.selectedBg} hover:opacity-90 text-white px-3 py-1 rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Set
              </button>
            </div>
          </div>
        )}

        {/* Selected Value Display */}
        <div className={`bg-white rounded-lg p-3 border ${theme.border}`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800 text-sm">Selected:</span>
            <div className="text-right">
              <span className={`text-xl font-bold ${theme.display}`}>
                {(value ?? 0).toLocaleString()}
              </span>
              {getRatioDisplay() && (
                <div className="text-xs text-gray-600 mt-1">
                  {getRatioDisplay()}
                </div>
              )}
            </div>
          </div>
        </div>

 
      </div>
    </div>
  );
};

export default SamplingField;