// client/src/components/selectors/ShiftSelector.tsx

import React, { useState, useEffect } from 'react';
import { shiftService } from '../../services/shiftService';
import { convertDropdownOptionsToBaseOptions } from '../../utils/convertUtils';
import { 
  type ShiftOption, 
  type ShiftSelectorProps,
  DEFAULT_SELECTOR_CONFIGS
} from '../../types/sysconfig';

export const ShiftSelector: React.FC<ShiftSelectorProps> = ({
  value,
  onChange,
  placeholder = DEFAULT_SELECTOR_CONFIGS.shift.placeholder,
  multiple = false,
  disabled = false,
  className = "",
  label,
  required = false
}) => {
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shiftService.getShifts();
      
      // Convert DropdownOption[] to ShiftOption[] using centralized utility
      const shiftOptions = convertDropdownOptionsToBaseOptions(response.data || []);
      setShifts(shiftOptions);
    } catch (err) {
      console.error('Error loading shifts:', err);
      setError(DEFAULT_SELECTOR_CONFIGS.shift.errorMessage);
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
            {loading ? DEFAULT_SELECTOR_CONFIGS.shift.loadingMessage : placeholder}
          </option>
        )}
        
        {shifts.map((shift) => (
          <option key={shift.value} value={shift.value}>
            {shift.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
      
      {loading && (
        <small className="text-muted">{DEFAULT_SELECTOR_CONFIGS.shift.loadingMessage}</small>
      )}
    </div>
  );
};

export default ShiftSelector;