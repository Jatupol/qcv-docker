// client/src/components/forms/GenericEntityCodeForm.tsx
// Generic Entity Form - Reusable modal form component for entities with code/name/is_active pattern

import React, { useState, useEffect } from 'react';
import { validateSchema, required, lengthBetween, pattern, normalizeErrors, type ValidationSchema } from '../../utils/validation';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import LoadingSpinner from '../ui/LoadingSpinner';

// ============ INTERFACES ============

export interface EntityData {
  code: string;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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
  entity?: EntityData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EntityCodeFormData | UpdateEntityCodeFormData) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  loading?: boolean;
  entityName: string; // e.g., "Shift", "Site", "Tab", etc.
  entityDescription?: string; // e.g., "work shifts", "production sites", etc.
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

// ============ GENERIC ENTITY FORM COMPONENT ============

const GenericEntityCodeForm: React.FC<GenericEntityCodeFormProps> = ({
  mode,
  entity,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  entityName,
  entityDescription,
  codeValidationRules = {
    minLength: 1,
    maxLength: 10,
    pattern: /^[A-Z0-9]+$/,
    patternMessage: 'Code must contain only uppercase letters and numbers'
  },
  nameValidationRules = {
    minLength: 3,
    maxLength: 100
  },
  codePlaceholder,
  namePlaceholder
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
    if (mode === 'edit' && entity) {
      setFormData({
        code: entity.code,
        name: entity.name,
        is_active: entity.is_active
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
  }, [mode, entity, isOpen]);

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

    // Code validation
    const codeRules = [
      required(`${entityName} code is required`),
      lengthBetween(
        codeValidationRules.minLength || 1,
        codeValidationRules.maxLength || 10,
        `${entityName} code must be between ${codeValidationRules.minLength || 1} and ${codeValidationRules.maxLength || 10} characters`
      ),
    ];

    if (codeValidationRules.pattern) {
      codeRules.push(
        pattern(
          codeValidationRules.pattern,
          codeValidationRules.patternMessage || `Invalid ${entityName.toLowerCase()} code format`
        )
      );
    }

    schema.code = codeRules;

    // Name validation
    schema.name = [
      required(`${entityName} name is required`),
      lengthBetween(
        nameValidationRules.minLength || 1,
        nameValidationRules.maxLength || 100,
        `${entityName} name must be between ${nameValidationRules.minLength || 1} and ${nameValidationRules.maxLength || 100} characters`
      ),
    ];

    const validationErrors = validateSchema(formData, schema);
    const normalizedErrors = normalizeErrors(validationErrors);
    setErrors(normalizedErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = mode === 'create' 
        ? formData as EntityCodeFormData
        : { name: formData.name, is_active: formData.is_active } as UpdateEntityCodeFormData;

      const result = await onSubmit(submitData);
      
      if (result.success) {
        setIsDirty(false);
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } catch (error) {
      setErrors({ general: ['An unexpected error occurred'] });
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // ============ RENDER ============

  const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  const defaultCodePlaceholder = codePlaceholder || `Enter ${entityName.toLowerCase()} code`;
  const defaultNamePlaceholder = namePlaceholder || `Enter ${entityName.toLowerCase()} name`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? `Create New ${entityName}` : `Edit ${entityName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errors.general.join(', ')}
          </div>
        )}

        {/* Code Field */}
        <div>
          <Input
            label={`${entityName} Code`}
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            error={errors.code?.join(', ')}
            placeholder={defaultCodePlaceholder}
            disabled={mode === 'edit' || loading}
            required
            maxLength={codeValidationRules.maxLength || 10}
            style={{ textTransform: 'uppercase' }}
          />
          <p className="mt-1 text-sm text-gray-500">
            {codeValidationRules.patternMessage || 'Code must be uppercase letters and numbers only'} 
            ({codeValidationRules.minLength || 1}-{codeValidationRules.maxLength || 10} characters)
          </p>
        </div>

        {/* Name Field */}
        <div>
          <Input
            label={`${entityName} Name`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name?.join(', ')}
            placeholder={defaultNamePlaceholder}
            disabled={loading}
            required
            maxLength={nameValidationRules.maxLength || 100}
          />
          <p className="mt-1 text-sm text-gray-500">
            Name must be between {nameValidationRules.minLength || 3} and {nameValidationRules.maxLength || 100} characters
            {entityDescription && ` (e.g., ${entityDescription})`}
          </p>
        </div>

        {/* Status Field */}
        <div>
          <Select
            label="Status"
            value={formData.is_active.toString()}
            onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
            options={statusOptions}
            disabled={loading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
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
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              mode === 'create' ? `Create ${entityName}` : `Update ${entityName}`
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GenericEntityCodeForm;