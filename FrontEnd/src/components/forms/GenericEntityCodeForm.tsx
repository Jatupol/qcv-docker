// client/src/components/forms/GenericEntityCodeForm.tsx
// Generic Entity Code Form - Reusable form component for entities with code/name/is_active pattern

import React, { useState, useEffect } from 'react';
import { validateSchema, required, lengthBetween, pattern, normalizeErrors, type ValidationSchema } from '../../utils/validation';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

// ============ INTERFACES ============
export interface EntityData {
  code: string;                    // VARCHAR(5) PRIMARY KEY
  name: string;                    // VARCHAR(100) UNIQUE NOT NULL
  is_active: boolean;              // BOOLEAN DEFAULT true
  created_by: number;              // INT DEFAULT 0
  updated_by: number;              // INT DEFAULT 0
  created_at: Date;                // TIMESTAMP WITH TIME ZONE
  updated_at: Date;                // TIMESTAMP WITH TIME ZONE
}

export interface EntityCodeFormData {
  code: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateEntityCodeFormData {
  name?: string;
  is_active?: boolean;
}

interface GenericEntityCodeFormProps {
  mode: 'create' | 'edit';
  initialData?: EntityData;
  onSubmit: (data: EntityCodeFormData | UpdateEntityCodeFormData) => void;
  onCancel: () => void;
  loading?: boolean;
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
}

interface FormData {
  code: string;
  name: string;
  is_active: boolean;
}

interface FormErrors {
  code?: string[];
  name?: string[];
  general?: string[];
}

// ============ GENERIC ENTITY CODE FORM COMPONENT ============

const GenericEntityCodeForm: React.FC<GenericEntityCodeFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  codeValidationRules = {
    minLength: 1,
    maxLength: 10,
    pattern: /^[A-Z0-9]+$/,
    patternMessage: 'Code must contain only uppercase letters and numbers'
  },
  nameValidationRules = {
    minLength: 1,
    maxLength: 100
  },
  codePlaceholder = 'Enter code',
  namePlaceholder = 'Enter name'
}) => {
  // ============ STATE ============
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    is_active: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // ============ EFFECTS ============

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        code: initialData.code,
        name: initialData.name,
        is_active: initialData.is_active
      });
    } else {
      setFormData({
        code: '',
        name: '',
        is_active: true
      });
    }
    setErrors({});
    setIsDirty(false);
  }, [mode, initialData]);

  // ============ HANDLERS ============

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

    const validateForm = (): boolean => {
    const schema: any = {};

    // Code validation (only for create mode)
    if (mode === 'create') {
      const codeRules = [
        required('Code is required'),
        lengthBetween(
          codeValidationRules.minLength || 1,
          codeValidationRules.maxLength || 10,
          `Code must be between ${codeValidationRules.minLength || 1} and ${codeValidationRules.maxLength || 10} characters`
        ),
      ];
      if (codeValidationRules.pattern) {
        codeRules.push(
          pattern(codeValidationRules.pattern, codeValidationRules.patternMessage || 'Invalid code format')
        );
      }
      schema.code = codeRules;
    }

    // Name validation
    schema.name = [
      required('Name is required'),
      lengthBetween(
        nameValidationRules.minLength || 1,
        nameValidationRules.maxLength || 100,
        `Name must be between ${nameValidationRules.minLength || 1} and ${nameValidationRules.maxLength || 100} characters`
      ),
    ];

    const validationErrors = validateSchema(formData, schema);
    const normalizedErrors = normalizeErrors(validationErrors);
    setErrors(normalizedErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || loading) {
      return;
    }

    const submitData = mode === 'create' 
      ? {
          code: formData.code.trim().toUpperCase(),
          name: formData.name.trim(),
          is_active: formData.is_active
        } as EntityCodeFormData
      : {
          name: formData.name.trim(),
          is_active: formData.is_active
        } as UpdateEntityCodeFormData;

    onSubmit(submitData);
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  // ============ RENDER HELPERS ============

  const renderError = (fieldErrors?: string[]) => {
    if (!fieldErrors || fieldErrors.length === 0) return null;
    
    return (
      <div className="mt-1">
        {fieldErrors.map((error, index) => (
          <p key={index} className="text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>
    );
  };

  // ============ RENDER ============

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Errors */}
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <div className="text-sm text-red-700">
                {errors.general.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Field - Only show in create mode */}
      {mode === 'create' && (
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Code <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <Input
              type="text"
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              placeholder={codePlaceholder}
              disabled={loading}
              className={errors.code ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
              maxLength={codeValidationRules.maxLength}
            />
          </div>
          {renderError(errors.code)}
          {codeValidationRules.patternMessage && (
            <p className="mt-1 text-xs text-gray-500">
              {codeValidationRules.patternMessage}
            </p>
          )}
        </div>
      )}

      {/* Code Field - Display only in edit mode */}
      {mode === 'edit' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Code
          </label>
          <div className="mt-1">
            <Input
              type="text"
              value={formData.code}
              disabled={true}
              className="bg-gray-50 text-gray-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Code cannot be changed after creation
          </p>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <Input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder={namePlaceholder}
            disabled={loading}
            className={errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            maxLength={nameValidationRules.maxLength}
          />
        </div>
        {renderError(errors.name)}
      </div>

      {/* Status Field */}
      <div>
        <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <div className="mt-1">
          <Select
            id="is_active"
            value={formData.is_active ? 'true' : 'false'}
            onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
            disabled={loading}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {formData.is_active ? 'This item is currently active and visible' : 'This item is currently inactive and hidden'}
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={handleCancel}
          variant="secondary"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !isDirty}
        >
          {loading ? (
            mode === 'create' ? 'Creating...' : 'Updating...'
          ) : (
            mode === 'create' ? 'Create' : 'Update'
          )}
        </Button>
      </div>
    </form>
  );
};

export default GenericEntityCodeForm;