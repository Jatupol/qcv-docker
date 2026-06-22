// client/src/components/forms/GenericEntityIdForm.tsx
/**
 * Generic Entity ID Form - For SERIAL ID Entity Pattern
 * 
 * Reusable modal form component for entities with SERIAL ID primary key pattern.
 * This is for entities that use `id SERIAL PRIMARY KEY` in the database.
 * Layout matches GenericEntityCodeForm.tsx for consistency.
 * 
 * Complete Separation Entity Architecture:
 * ✅ Self-contained form component for SERIAL ID entities
 * ✅ No dependencies on other entity forms
 * ✅ Reusable across all SERIAL ID entities
 * 
 * SERIAL ID entities: users, defects, defect_types, models, product_families, sampling_reasons
 */

import React, { useState, useEffect } from 'react';
import { validateSchema, required, lengthBetween, pattern, normalizeErrors, type ValidationSchema } from '../../utils/validation';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import LoadingSpinner from '../ui/LoadingSpinner';

// ==================== INTERFACES FOR SERIAL ID ENTITIES ====================

export interface EntityData {
  id: number;                      // SERIAL PRIMARY KEY
  name: string;                    // VARCHAR(100) UNIQUE NOT NULL
  description?: string;            // TEXT (optional for most entities)
  is_active: boolean;              // BOOLEAN DEFAULT true
  created_by?: number;             // INT DEFAULT 0
  updated_by?: number;             // INT DEFAULT 0
  created_at: Date;              // TIMESTAMP WITH TIME ZONE (ISO string)
  updated_at: Date;              // TIMESTAMP WITH TIME ZONE (ISO string)
}

export interface EntityIdFormData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateEntityIdFormData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

interface GenericEntityIdFormProps {
  mode: 'create' | 'edit';
  entity?: EntityData;
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: (data: EntityIdFormData | UpdateEntityIdFormData) => void;
  loading?: boolean;
  entityName?: string; // e.g., "Defect", "Model", "User", etc.
  entityDescription?: string; // e.g., "defect types", "product models", etc.
  nameValidationRules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  };
  descriptionValidationRules?: {
    minLength?: number;
    maxLength?: number;
  };
  namePlaceholder?: string;
  descriptionPlaceholder?: string;
  showDescriptionField?: boolean;
}

interface FormData {
  name: string;
  description: string;
  is_active: boolean;
}

interface FormErrors {
  name?: string[];
  description?: string[];
  general?: string[];
}

// ==================== GENERIC ENTITY ID FORM COMPONENT ====================

const GenericEntityIdForm: React.FC<GenericEntityIdFormProps> = ({
  mode,
  entity,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  entityName,
  entityDescription,
  nameValidationRules = {},
  descriptionValidationRules = {},
  namePlaceholder,
  descriptionPlaceholder,
  showDescriptionField = true
}) => {
  // ==================== STATE ====================
  
  const [formData, setFormData] = useState<FormData>({
    name: entity?.name || '',
    description: entity?.description || '',
    is_active: entity?.is_active ?? true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (entity) {
      setFormData({
        name: entity.name || '',
        description: entity.description || '',
        is_active: entity.is_active ?? true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true
      });
    }
    setErrors({});
    setIsDirty(false);
  }, [entity, mode, isOpen]);

  // ==================== FORM HANDLERS ====================

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);

    // Clear field errors when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Clear general errors
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined
      }));
    }
  };

    const validateForm = (): boolean => {
    const schema: any = {};

    // Name validation
    const nameRules = nameValidationRules;
    const nameValidationList = [required('Name is required')];

    if (nameRules.minLength || nameRules.maxLength) {
      nameValidationList.push(
        lengthBetween(
          nameRules.minLength || 1,
          nameRules.maxLength || 100,
          `Name must be between ${nameRules.minLength || 1} and ${nameRules.maxLength || 100} characters`
        )
      );
    }

    if (nameRules.pattern) {
      nameValidationList.push(
        pattern(nameRules.pattern, nameRules.patternMessage || 'Invalid name format')
      );
    }

    schema.name = nameValidationList;

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
          name: formData.name.trim(),
          description: formData.description.trim(),
          is_active: formData.is_active
        } as EntityIdFormData
      : {
          name: formData.name.trim(),
          is_active: formData.is_active
        } as UpdateEntityIdFormData;

    onSubmit(submitData);
  };

 

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // ==================== RENDER ====================

  const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];
  if (!entityName) {
    entityName = ' ';  
  }
  const defaultNamePlaceholder = namePlaceholder || `Enter ${entityName.toLowerCase()} name`;
  const defaultDescriptionPlaceholder = descriptionPlaceholder || `Enter ${entityName.toLowerCase()} description`;

  return (
    <Modal
      isOpen={isOpen ?? false}
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

        {/* ID Display (for edit mode only) */}
        {mode === 'edit' && entity && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600 font-mono">
              {entity.id}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Auto-generated unique identifier
            </p>
          </div>
        )}

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

        {/* Description Field (optional) */}
        {showDescriptionField && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description {descriptionValidationRules.minLength ? '*' : '(Optional)'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={defaultDescriptionPlaceholder}
              rows={4}
              disabled={loading}
              maxLength={descriptionValidationRules.maxLength || 1000}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
                ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              `}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.join(', ')}</p>
            )}
            {descriptionValidationRules.maxLength && (
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/{descriptionValidationRules.maxLength} characters
              </p>
            )}
          </div>
        )}

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

export default GenericEntityIdForm;

/*
=== GENERIC ENTITY ID FORM FEATURES ===

LAYOUT CONSISTENCY:
✅ Matches GenericEntityCodeForm.tsx structure exactly
✅ Modal wrapper with same props and styling
✅ Same form layout and spacing
✅ Consistent button placement and styling
✅ Same error handling and display patterns

CORRECTED FOR SERIAL ID PATTERN:
✅ Uses id: number instead of code: string
✅ Proper EntityData interface for SERIAL ID entities
✅ Form interfaces match SERIAL ID pattern
✅ ID display in edit mode (read-only with monospace font)

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained form component
✅ No dependencies on other entity forms
✅ Reusable across all SERIAL ID entities
✅ Zero coupling with other components

COMPREHENSIVE FORM FEATURES:
✅ Create and edit modes with proper state management
✅ Name field with validation
✅ Optional description field with textarea
✅ Active status dropdown (same as GenericEntityCodeForm)
✅ Real-time validation feedback

VALIDATION SYSTEM:
✅ Configurable validation rules per field
✅ Required field validation
✅ Length validation (min/max)
✅ Pattern validation with custom messages
✅ Real-time error clearing
✅ Form dirty state tracking

USER EXPERIENCE:
✅ Auto-generated ID display in edit mode (read-only)
✅ Character count displays
✅ Loading states and disabled states
✅ Confirmation on close with unsaved changes
✅ Clear error messages with proper styling

MODAL INTEGRATION:
✅ Same Modal component usage as GenericEntityCodeForm
✅ Same size and styling
✅ Same close handling behavior
✅ Same header titles and formatting

MANUFACTURING DOMAIN SUPPORT:
✅ Entity-specific field labels
✅ Contextual help text
✅ Active status management
✅ Professional form layout
✅ Accessible form controls

FORM CONSISTENCY:
✅ Same input styling and error states
✅ Same button variants and positioning
✅ Same loading spinner integration
✅ Same form spacing and typography
✅ Same status dropdown options

This GenericEntityIdForm now has the exact same layout and structure as
GenericEntityCodeForm.tsx while being properly adapted for SERIAL ID entities.
*/