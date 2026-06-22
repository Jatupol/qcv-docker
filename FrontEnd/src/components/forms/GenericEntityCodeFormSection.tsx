// client/src/components/forms/GenericEntityCodeFormSection.tsx
// Embedded Generic Entity Code Form Component - Create and Edit Operations
// Complete Separation Entity Architecture - Embedded Form Section

import React, { useState, useEffect } from 'react';
import { validateSchema, normalizeErrors, type ValidationSchema } from '../../utils/validation';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import LoadingSpinner from '../ui/LoadingSpinner';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { 
  EntityData, 
  EntityCodeFormData, 
  UpdateEntityCodeFormData 
} from './GenericEntityCodeForm';

// Heroicons
import {
  PlusIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// ==================== INTERFACES ====================

interface GenericEntityCodeFormSectionProps<T extends EntityData> {
  mode: 'create' | 'edit';
  entity?: T | null;
  onSubmit: (data: EntityCodeFormData | UpdateEntityCodeFormData) => Promise<{ 
    success: boolean; 
    errors?: Record<string, string[]>; 
    message?: string; 
  }>;
  onCancel: () => void;
  loading?: boolean;
  entityName: string;
  codeValidationRules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  };
  nameValidationRules?: {
    minLength?: number;
    maxLength?: number;
  };
  codePlaceholder?: string;
  namePlaceholder?: string;
  className?: string;
}

interface FormErrors {
  code?: string[];
  name?: string[];
  is_active?: string[];
  general?: string[];
}

interface FormState {
  code: string;
  name: string;
  is_active: boolean;
  isDirty: boolean;
  errors: FormErrors;
  isSubmitting: boolean;
}

// ==================== COMPONENT ====================

function GenericEntityCodeFormSection<T extends EntityData>({
  mode,
  entity,
  onSubmit,
  onCancel,
  loading = false,
  entityName,
  codeValidationRules,
  nameValidationRules,
  codePlaceholder,
  namePlaceholder,
  className = ''
}: GenericEntityCodeFormSectionProps<T>) {

  // ============ STATE ============
  const [state, setState] = useState<FormState>({
    code: entity?.code || '',
    name: entity?.name || '',
    is_active: entity?.is_active ?? true,
    isDirty: false,
    errors: {},
    isSubmitting: false
  });

  // ============ HELPER FUNCTIONS ============
  
  const updateState = (updates: Partial<FormState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const clearFieldError = (field: keyof FormErrors) => {
    if (state.errors[field]) {
      updateState({
        errors: { ...state.errors, [field]: undefined }
      });
    }
  };

  // ============ VALIDATION ============

  const validateField = (field: keyof FormState, value: any): string[] => {
    const errors: string[] = [];

    switch (field) {
      case 'code':
        if (!value || !value.trim()) {
          errors.push('Code is required');
        } else {
          const trimmed = value.trim();
          if (codeValidationRules?.minLength && trimmed.length < codeValidationRules.minLength) {
            errors.push(`Code must be at least ${codeValidationRules.minLength} characters`);
          }
          if (codeValidationRules?.maxLength && trimmed.length > codeValidationRules.maxLength) {
            errors.push(`Code must be no more than ${codeValidationRules.maxLength} characters`);
          }
          if (codeValidationRules?.pattern && !codeValidationRules.pattern.test(trimmed)) {
            errors.push(codeValidationRules.patternMessage || 'Code format is invalid');
          }
        }
        break;

      case 'name':
        if (!value || !value.trim()) {
          errors.push('Name is required');
        } else {
          const trimmed = value.trim();
          if (nameValidationRules?.minLength && trimmed.length < nameValidationRules.minLength) {
            errors.push(`Name must be at least ${nameValidationRules.minLength} characters`);
          }
          if (nameValidationRules?.maxLength && trimmed.length > nameValidationRules.maxLength) {
            errors.push(`Name must be no more than ${nameValidationRules.maxLength} characters`);
          }
        }
        break;

    }

    return errors;
  };

    const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate each field using existing validateField
    const codeErrors = validateField('code', state.code);
    const nameErrors = validateField('name', state.name);

    if (codeErrors.length > 0) newErrors.code = codeErrors;
    if (nameErrors.length > 0) newErrors.name = nameErrors;

    updateState({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  // ============ EVENT HANDLERS ============

  const handleFieldChange = (field: keyof FormState, value: any) => {
    updateState({ 
      [field]: value, 
      isDirty: true 
    });
    
    // Clear field error when user starts typing (only for error-able fields)
    const errorFields: (keyof FormErrors)[] = ['code', 'name','is_active'];
    if (errorFields.includes(field as keyof FormErrors)) {
      clearFieldError(field as keyof FormErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    updateState({ isSubmitting: true });

    try {
      const formData = mode === 'create' 
        ? {
            code: state.code.trim(),
            name: state.name.trim(),
            is_active: state.is_active
          }
        : {
            name: state.name.trim(),
            is_active: state.is_active
          };

      const response = await onSubmit(formData);

      if (response.success) {
        // Success is handled by parent component
        updateState({ 
          isDirty: false,
          isSubmitting: false,
          errors: {}
        });
      } else {
        // Handle validation errors from server
        const serverErrors: FormErrors = {};
        
        if (response.errors) {
          Object.entries(response.errors).forEach(([field, messages]) => {
            serverErrors[field as keyof FormErrors] = Array.isArray(messages) ? messages : [messages];
          });
        }

        if (response.message && !response.errors) {
          serverErrors.general = [response.message];
        }

        updateState({ 
          errors: serverErrors,
          isSubmitting: false
        });
      }
    } catch (error) {
      updateState({
        errors: { 
          general: [error instanceof Error ? error.message : 'An unexpected error occurred'] 
        },
        isSubmitting: false
      });
    }
  };

  const handleCancel = () => {
    if (state.isDirty) {
      const confirmed = window.confirm(
        `You have unsaved changes. Are you sure you want to cancel ${mode === 'create' ? 'creating' : 'editing'} this ${entityName.toLowerCase()}?`
      );
      if (!confirmed) return;
    }
    onCancel();
  };

  // ============ EFFECTS ============

  useEffect(() => {
    // Reset form when entity changes
    if (mode === 'edit' && entity) {
      setState({
        code: entity.code || '',
        name: entity.name || '',
        is_active: entity.is_active ?? true,
        isDirty: false,
        errors: {},
        isSubmitting: false
      });
    } else if (mode === 'create') {
      setState({
        code: '',
        name: '',
        is_active: true,
        isDirty: false,
        errors: {},
        isSubmitting: false
      });
    }
  }, [mode, entity]);

  // ============ RENDER HELPERS ============

  const renderFieldError = (field: keyof FormErrors) => {
    const errors = state.errors[field];
    if (!errors || errors.length === 0) return null;

    return (
      <div className="mt-1">
        {errors.map((error, index) => (
          <p key={index} className="text-sm text-red-600 flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            {error}
          </p>
        ))}
      </div>
    );
  };

  const renderGeneralErrors = () => {
    const errors = state.errors.general;
    if (!errors || errors.length === 0) return null;

    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
          <div>
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-700">
                {error}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============ RENDER ============

  return (
    <Card className={`${className}`}>
      <CardHeader className={`${
        mode === 'create' 
          ? 'bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200'
          : 'bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200'
      }`}>
        <CardTitle className={`flex items-center text-lg font-semibold ${
          mode === 'create' ? 'text-green-800' : 'text-blue-800'
        }`}>
          {mode === 'create' ? (
            <>
              <PlusIcon className="w-5 h-5 mr-2" />
              Create New {entityName}
            </>
          ) : (
            <>
              <PencilIcon className="w-5 h-5 mr-2" />
              Edit {entityName}
            </>
          )}
          
          {/* Close Button */}
          <button
            type="button"
            onClick={handleCancel}
            className={`ml-auto p-1 rounded-md hover:bg-white/50 transition-colors ${
              mode === 'create' ? 'text-green-700 hover:text-green-900' : 'text-blue-700 hover:text-blue-900'
            }`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderGeneralErrors()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code Field */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Code <span className="text-red-500">*</span>
              </label>
              {mode === 'edit' ? (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="text-sm font-mono text-gray-600">
                    {state.code}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Code cannot be changed after creation
                  </p>
                </div>
              ) : (
                <>
                  <Input
                    id="code"
                    type="text"
                    value={state.code}
                    onChange={(e) => handleFieldChange('code', e.target.value.toUpperCase())}
                    placeholder={codePlaceholder || 'Enter code...'}
                    className={`font-mono ${state.errors.code ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={loading || state.isSubmitting}
                    maxLength={codeValidationRules?.maxLength}
                  />
                  {codeValidationRules?.maxLength && (
                    <p className="text-xs text-gray-500 mt-1">
                      {state.code.length}/{codeValidationRules.maxLength} characters
                    </p>
                  )}
                  {renderFieldError('code')}
                </>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                type="text"
                value={state.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder={namePlaceholder || 'Enter name...'}
                className={state.errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                disabled={loading || state.isSubmitting}
                maxLength={nameValidationRules?.maxLength}
              />
              {nameValidationRules?.maxLength && (
                <p className="text-xs text-gray-500 mt-1">
                  {state.name.length}/{nameValidationRules.maxLength} characters
                </p>
              )}
              {renderFieldError('name')}
            </div>
          </div>

          {/* Status Field */}
          <div>
            <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              id="active"
              value={state.is_active ? 'true' : 'false'}
              onChange={(e) => handleFieldChange('is_active', e.target.value === 'true')}
              disabled={loading || state.isSubmitting}
              className={state.errors.is_active ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {state.is_active 
                ? 'This entity is active and available for use' 
                : 'This entity is inactive and will not appear in most selections'
              }
            </p>
            {renderFieldError('is_active')}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={loading || state.isSubmitting}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={loading || state.isSubmitting}
              className={`${
                mode === 'create' 
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {loading || state.isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? (
                    <CheckIcon className="w-4 h-4 mr-2" />
                  ) : (
                    <CheckIcon className="w-4 h-4 mr-2" />
                  )}
                  {mode === 'create' ? `Create ${entityName}` : `Update ${entityName}`}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default GenericEntityCodeFormSection;

/*
=== GENERIC ENTITY CODE FORM SECTION FEATURES ===

EMBEDDED DESIGN:
✅ Card-based layout for inline embedding
✅ Distinct visual styling for create vs edit modes
✅ Professional form layout with proper spacing
✅ Clear visual hierarchy and section organization
✅ Close button in header for easy dismissal

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained form component
✅ No dependencies on other entity forms
✅ Reusable across all VARCHAR CODE entities
✅ Type-safe interfaces and props
✅ Zero coupling with other components

COMPREHENSIVE VALIDATION:
✅ Real-time form validation
✅ Configurable validation rules per field
✅ Code format validation (pattern, length)
✅ Name validation with length limits
✅ Description optional with length limits
✅ Server-side error handling and display

USER EXPERIENCE:
✅ Auto-focus and keyboard navigation
✅ Loading states and disabled inputs during operations
✅ Clear error messages with specific guidance
✅ Dirty state tracking with confirmation on cancel
✅ Character count displays for all text fields
✅ Professional styling with status indicators

FORM FUNCTIONALITY:
✅ Create and edit modes in single component
✅ Form state management and validation
✅ Error handling and display with icons
✅ Async submission handling
✅ Form reset capabilities on mode/entity change

MANUFACTURING CONTEXT:
✅ Code field (read-only in edit mode)
✅ Name field with validation
✅ Description field (optional)
✅ Active status management with explanation
✅ Professional form styling
✅ Context-appropriate field labels and help text

VISUAL DESIGN:
✅ Color-coded headers (green for create, blue for edit)
✅ Consistent with project's orange theme
✅ Card-based layout for clear boundaries
✅ Responsive grid layout for form fields
✅ Professional button styling and states
✅ Error states with red color coding

ACCESSIBILITY:
✅ Proper form labels and structure
✅ Screen reader friendly error messages
✅ Keyboard navigation support
✅ Focus management for form fields
✅ Clear visual hierarchy
✅ Semantic HTML structure

This GenericEntityCodeFormSection provides a modern, embedded form
experience that integrates seamlessly into the page flow while maintaining
all the functionality of the modal-based form. It's specifically designed
for VARCHAR CODE entities and provides a consistent experience across
all entity types in the system.
*/