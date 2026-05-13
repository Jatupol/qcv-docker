// client/src/components/forms/GenericEntityComplexForm.tsx
// Complex Form Component for SPECIAL Entities with Multiple Fields
// Complete Separation Entity Architecture - Configurable Complex Form

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { XMarkIcon } from '@heroicons/react/24/outline';

// ============ ASYNC SELECT COMPONENT ============

interface AsyncSelectProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  className: string;
  disabled?: boolean;
}

const AsyncSelect: React.FC<AsyncSelectProps> = ({ field, value, onChange, className, disabled }) => {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      if (!field.asyncOptions) return;

      setLoading(true);
      setError(null);

      try {
        console.log(`🔄 Loading async options for ${field.label}...`);
        const fetchedOptions = await field.asyncOptions();
        console.log(`✅ Loaded ${fetchedOptions.length} options for ${field.label}:`, fetchedOptions);
        setOptions(fetchedOptions);
      } catch (err) {
        console.error(`❌ Error loading options for ${field.label}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load options');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [field.asyncOptions, field.label]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center py-3 bg-gray-50`}>
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
        <span className="ml-2 text-gray-500 text-sm">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-red-50 border-red-300 text-red-600`}>
        <div className="flex items-center justify-between py-2 px-3">
          <span className="text-sm">⚠ {error}</span>
        </div>
      </div>
    );
  }

  return (
    <select
      id={field.key}
      name={field.key}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
      disabled={disabled || field.disabled}
      className={className}
    >
      <option value="">{field.placeholder || `Select ${field.label}`}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// ============ INTERFACES ============

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'email' | 'password' | 'date' | 'component';
  required?: boolean;
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    patternMessage?: string;
    custom?: (value: any) => string | null;
  };
  options?: Array<{ value: string; label: string }>; // For select fields
  asyncOptions?: () => Promise<Array<{ value: string; label: string }>>; // For async select fields
  component?: React.ComponentType<any>; // For custom components
  componentProps?: Record<string, any>; // Props for custom components
  disabled?: boolean;
  readonly?: boolean;
  allowEditPrimaryKey?: boolean; // Allow editing primary key field in edit mode
  defaultValue?: any;
  width?: 'full' | 'half' | 'third' | 'quarter'; // Grid width
  dependsOn?: string; // Field dependency
  showWhen?: (formData: Record<string, any>) => boolean; // Conditional display
  onChange?: (value: any, formData: Record<string, any>, setFormData: (data: Record<string, any>) => void) => void; // Field change callback
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface GenericEntityComplexFormProps {
  // Mode and Entity
  mode: 'create' | 'edit';
  entity?: Record<string, any>;

  // Form Configuration
  formTitle?: string;
  formDescription?: string;
  sections: FormSection[];

  // Handlers
  onSubmit: (data: Record<string, any>) => Promise<{ success: boolean; errors?: Record<string, string[]>; message?: string }>;
  onCancel: () => void;

  // State
  loading?: boolean;

  // Validation
  globalValidation?: (data: Record<string, any>) => Record<string, string[]>;

  // Styling
  modalSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showAsModal?: boolean;

  // Entity Specific
  entityName?: string;
  primaryKeyField?: string; // Field that serves as primary key (e.g., 'partno', 'id', 'code')
}

// ============ UTILITY FUNCTIONS ============

const getFieldWidth = (width: FormField['width']): string => {
  switch (width) {
    case 'half': return 'md:col-span-6';
    case 'third': return 'md:col-span-4';
    case 'quarter': return 'md:col-span-3';
    case 'full':
    default: return 'md:col-span-12';
  }
};

const validateField = (field: FormField, value: any): string | null => {
  if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${field.label} is required`;
  }

  if (!field.validation) return null;

  const validation = field.validation;

  // String validations
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${field.label} must be at most ${validation.maxLength} characters`;
    }
    if (validation.pattern && !validation.pattern.test(value)) {
      return validation.patternMessage || `${field.label} has invalid format`;
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && value > validation.max) {
      return `${field.label} must be at most ${validation.max}`;
    }
  }

  // Custom validation
  if (validation.custom) {
    return validation.custom(value);
  }

  return null;
};

// ============ MAIN COMPONENT ============

const GenericEntityComplexForm: React.FC<GenericEntityComplexFormProps> = ({
  mode,
  entity,
  formTitle,
  formDescription,
  sections,
  onSubmit,
  onCancel,
  loading = false,
  globalValidation,
  modalSize = 'xl',
  showAsModal = true,
  entityName = 'Entity',
  primaryKeyField = 'id'
}) => {
  // ============ STATE ============

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============ EFFECTS ============

  useEffect(() => {
    // Initialize form data
    const initialData: Record<string, any> = {};

    sections.forEach(section => {
      section.fields.forEach(field => {
        if (mode === 'edit' && entity) {
          initialData[field.key] = entity[field.key] ?? field.defaultValue ?? '';
        } else {
          initialData[field.key] = field.defaultValue ?? '';
        }
      });
    });

    setFormData(initialData);

    // Initialize collapsed sections
    const initialCollapsed = new Set<number>();
    sections.forEach((section, index) => {
      if (section.collapsible && !section.defaultExpanded) {
        initialCollapsed.add(index);
      }
    });
    setCollapsedSections(initialCollapsed);
  }, [mode, entity, sections]);

  // ============ HANDLERS ============

  const handleFieldChange = (fieldKey: string, value: any, field?: FormField) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldKey]: value
      };

      // Call field's onChange callback if defined
      if (field?.onChange) {
        field.onChange(value, newData, (updatedData) => {
          setFormData(updatedData);
        });
      }

      return newData;
    });

    // Clear field error when user starts typing
    if (errors[fieldKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const toggleSection = (sectionIndex: number) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate all fields
      const fieldErrors: Record<string, string[]> = {};

      sections.forEach(section => {
        section.fields.forEach(field => {
          // Skip validation if field is conditionally hidden
          if (field.showWhen && !field.showWhen(formData)) {
            return;
          }

          const error = validateField(field, formData[field.key]);
          if (error) {
            fieldErrors[field.key] = [error];
          }
        });
      });

      // Global validation
      if (globalValidation) {
        const globalErrors = globalValidation(formData);
        Object.keys(globalErrors).forEach(key => {
          if (fieldErrors[key]) {
            fieldErrors[key].push(...globalErrors[key]);
          } else {
            fieldErrors[key] = globalErrors[key];
          }
        });
      }

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      // Submit form
      const result = await onSubmit(formData);

      if (result.success) {
        // Success handled by parent component
      } else {
        if (result.errors) {
          setErrors(result.errors);
        }
        if (result.message) {
          // Show general error message
          setErrors(prev => ({
            ...prev,
            _general: [result.message!]
          }));
        }
      }
    } catch (error: any) {
      setErrors({
        _general: [error.message || 'An unexpected error occurred']
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ RENDER HELPERS ============

  const renderField = (field: FormField) => {
    // Check if field should be shown
    if (field.showWhen && !field.showWhen(formData)) {
      return null;
    }

    const fieldValue = formData[field.key] ?? '';
    const fieldErrors = errors[field.key] || [];
    const hasError = fieldErrors.length > 0;

    const baseInputClasses = `
      block w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
      hover:border-gray-400 focus:shadow-lg
      ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'}
      ${field.disabled || field.readonly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
      text-sm font-medium placeholder-gray-500
    `;

    const renderInput = () => {
      switch (field.type) {
        case 'textarea':
          return (
            <textarea
              id={field.key}
              name={field.key}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.key, e.target.value, field)}
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled || (mode === 'edit' && field.key === primaryKeyField && !field.allowEditPrimaryKey)}
              readOnly={field.readonly}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              rows={3}
              className={baseInputClasses}
            />
          );

        case 'select':
          // Use AsyncSelect if asyncOptions is provided, otherwise use regular select
          if (field.asyncOptions) {
            return (
              <AsyncSelect
                field={field}
                value={fieldValue}
                onChange={(value) => handleFieldChange(field.key, value, field)}
                className={baseInputClasses}
                disabled={field.disabled || field.readonly || (mode === 'edit' && field.key === primaryKeyField && !field.allowEditPrimaryKey)}
              />
            );
          }

          return (
            <select
              id={field.key}
              name={field.key}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.key, e.target.value, field)}
              required={field.required}
              disabled={field.disabled || field.readonly || (mode === 'edit' && field.key === primaryKeyField && !field.allowEditPrimaryKey)}
              className={baseInputClasses}
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'checkbox':
          return (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-orange-50 transition-colors duration-200">
              <input
                type="checkbox"
                id={field.key}
                name={field.key}
                checked={!!fieldValue}
                onChange={(e) => handleFieldChange(field.key, e.target.checked, field)}
                disabled={field.disabled || field.readonly || (mode === 'edit' && field.key === primaryKeyField && !field.allowEditPrimaryKey)}
                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded-md shadow-sm"
              />
              <label htmlFor={field.key} className="ml-3 block text-sm font-medium text-gray-900">
                {field.placeholder || field.label}
              </label>
            </div>
          );

        case 'number':
          return (
            <input
              type="number"
              id={field.key}
              name={field.key}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0, field)}
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled || (mode === 'edit' && field.key === primaryKeyField && !field.allowEditPrimaryKey)}
              readOnly={field.readonly}
              min={field.validation?.min}
              max={field.validation?.max}
              className={baseInputClasses}
            />
          );

        case 'component':
          if (field.component) {
            const Component = field.component;
            return (
              <Component
                value={fieldValue}
                onChange={(value: any) => handleFieldChange(field.key, value, field)}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled || field.readonly || (mode === 'edit' && field.key === primaryKeyField && !field.allowEditPrimaryKey)}
                {...(field.componentProps || {})}
              />
            );
          }
          return <div className="text-red-500">Component not specified</div>;

        default:
          return (
            <input
              type={field.type}
              id={field.key}
              name={field.key}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.key, e.target.value, field)}
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled || (mode === 'edit' && field.key === primaryKeyField && !field.allowEditPrimaryKey)}
              readOnly={field.readonly}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              pattern={field.validation?.pattern?.source}
              className={baseInputClasses}
            />
          );
      }
    };

    return (
      <div key={field.key} className={`${getFieldWidth(field.width)} space-y-2`}>
        {field.type !== 'checkbox' && (
          <label htmlFor={field.key} className="block text-sm font-semibold text-gray-800 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1 font-bold">*</span>}
          </label>
        )}

        {renderInput()}

        {hasError && (
          <div className="text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-1">
            {fieldErrors.map((error, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {error}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: FormSection, sectionIndex: number) => {
    const isCollapsed = collapsedSections.has(sectionIndex);

    return (
      <div key={sectionIndex} className="border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
        <div
          className={`px-6 py-5 rounded-t-xl ${section.collapsible ? 'cursor-pointer' : ''} ${
            section.collapsible ? 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50' : 'bg-gradient-to-r from-orange-50 to-amber-50'
          } border-b border-gray-100`}
          onClick={section.collapsible ? () => toggleSection(sectionIndex) : undefined}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">{section.title}</h3>
              {section.description && (
                <p className="mt-2 text-sm text-gray-600 font-medium">{section.description}</p>
              )}
            </div>
            {section.collapsible && (
              <button
                type="button"
                className="text-gray-400 hover:text-orange-600 transition-colors duration-200 text-lg font-bold"
              >
                {isCollapsed ? '⟨' : '⟩'}
              </button>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <div className="px-6 py-6">
            <div className="grid grid-cols-12 gap-6">
              {section.fields.map(renderField)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Errors */}
      {errors._general && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-lg">⚠</span>
            <div>
              {errors._general.map((error, index) => (
                <div key={index} className="font-medium">{error}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Header */}
      {(formTitle || formDescription) && (
        <div className="border-b border-gray-200 pb-6 mb-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 -mx-6 -mt-6 mb-6">
          {formTitle && (
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-orange-600">📝</span>
              {formTitle}
            </h2>
          )}
          {formDescription && (
            <p className="mt-3 text-sm text-gray-700 font-medium">
              {formDescription}
            </p>
          )}
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-6">
        {sections.map(renderSection)}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 bg-gray-50 rounded-lg p-6 -mx-6 -mb-6 mt-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 border border-transparent rounded-lg text-sm font-semibold text-white hover:from-orange-700 hover:to-orange-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {(isSubmitting || loading) && (
            <LoadingSpinner size="sm" className="mr-2" />
          )}
          <span className="mr-2">{mode === 'create' ? '➕' : '✏️'}</span>
          {mode === 'create' ? `Create ${entityName}` : `Update ${entityName}`}
        </button>
      </div>
    </form>
  );

  // ============ RENDER ============

  if (showAsModal) {
    return (
      <Modal
        isOpen={true}
        onClose={onCancel}
        title={mode === 'create' ? `Create New ${entityName}` : `Edit ${entityName}`}
        size={modalSize}
      >
        <div className="p-6">
          {formContent}
        </div>
      </Modal>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      {formContent}
    </div>
  );
};

export default GenericEntityComplexForm;

/*
=== GENERIC ENTITY COMPLEX FORM FEATURES ===

COMPREHENSIVE FORM BUILDER:
✅ Configurable sections with fields
✅ Multiple field types (text, textarea, select, checkbox, number, custom components)
✅ Field validation with custom rules
✅ Conditional field display based on form data
✅ Flexible field widths (full, half, third, quarter)

VALIDATION SYSTEM:
✅ Required field validation
✅ Length validation (min/max)
✅ Pattern validation with regex
✅ Custom validation functions
✅ Global form validation
✅ Real-time error display

ADVANCED FEATURES:
✅ Collapsible sections
✅ Field dependencies and conditional display
✅ Custom component integration
✅ Primary key field protection (read-only in edit mode)
✅ Modal or inline display options

PROFESSIONAL UI/UX:
✅ Clean grid-based layout
✅ Orange theme consistency
✅ Loading states and disabled states
✅ Error highlighting and messages
✅ Responsive design

ENTITY PATTERN SUPPORT:
✅ Works with any entity type (ID, CODE, or SPECIAL)
✅ Configurable primary key field
✅ Create and edit modes
✅ Entity-specific customization

INTEGRATION READY:
✅ Promise-based submission handling
✅ Error response parsing
✅ Loading state management
✅ Cancel functionality

This component provides a complete solution for complex entity forms
while maintaining the separation of concerns and reusability principles.
*/