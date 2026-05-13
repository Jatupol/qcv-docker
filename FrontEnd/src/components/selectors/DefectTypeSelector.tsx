// client/src/components/selectors/DefectTypeSelector.tsx

import React, { useState, useEffect } from 'react';
import { defectTypeService } from '../../services/defectTypeService';
import { convertDropdownOptionsToBaseOptions } from '../../utils/convertUtils';
import { 
  type DefectTypeOption, 
  type DefectTypeSelectorProps,
  DEFAULT_SELECTOR_CONFIGS
} from '../../types/sysconfig';

export const DefectTypeSelector: React.FC<DefectTypeSelectorProps> = ({
  value,
  onChange,
  placeholder = DEFAULT_SELECTOR_CONFIGS.defectType.placeholder,
  multiple = false,
  disabled = false,
  className = "",
  label,
  required = false
}) => {
  const [defectTypes, setDefectTypes] = useState<DefectTypeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDefectTypes();
  }, []);

  const loadDefectTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await defectTypeService.getDefectTypes();
      
      // Convert DropdownOption[] to DefectTypeOption[] using centralized utility
      const defectTypeOptions = convertDropdownOptionsToBaseOptions(response.data || []);
      setDefectTypes(defectTypeOptions);
    } catch (err) {
      console.error('Error loading defect types:', err);
      setError(DEFAULT_SELECTOR_CONFIGS.defectType.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    
    if (multiple) {
      const selectedOptions = Array.from(e.target.selectedOptions);
      const values = selectedOptions.map(option => option.value);
      onChange(values.length > 0 ? values : null);
    } else {
      onChange(selectedValue || null);
    }
  };

  const getSelectedValue = () => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return value || '';
  };

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      
      <select
        value={getSelectedValue()}
        onChange={handleChange}
        disabled={disabled || loading}
        multiple={multiple}
        className={`form-select ${error ? 'is-invalid' : ''}`}
        required={required}
      >
        {!multiple && (
          <option value="">
            {loading ? DEFAULT_SELECTOR_CONFIGS.defectType.loadingMessage : placeholder}
          </option>
        )}
        
        {defectTypes.map((defectType) => (
          <option key={defectType.value} value={defectType.value}>
            {defectType.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
      
      {loading && (
        <small className="text-muted">{DEFAULT_SELECTOR_CONFIGS.defectType.loadingMessage}</small>
      )}
    </div>
  );
};

export default DefectTypeSelector;