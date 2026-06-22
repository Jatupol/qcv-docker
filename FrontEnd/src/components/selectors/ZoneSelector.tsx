// client/src/components/selectors/ZoneSelector.tsx

import React, { useState, useEffect } from 'react';
import { zoneService } from '../../services/zoneService';

import { convertDropdownOptionsToBaseOptions } from '../../utils/convertUtils';
import { 
  type ZoneOption, 
  type ZoneSelectorProps,
  DEFAULT_SELECTOR_CONFIGS
} from '../../types/sysconfig';

export const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  value,
  onChange,
  placeholder = DEFAULT_SELECTOR_CONFIGS.group.placeholder,
  multiple = false,
  disabled = false,
  className = "",
  label,
  required = false
}) => {
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await zoneService.getZones();
      
      // Convert DropdownOption[] to ZoneOption[] to ensure code is always string
      const zoneOptions = convertDropdownOptionsToBaseOptions(response.data || []);
      setZones(zoneOptions);
    } catch (err) {
      console.error('Error loading zones:', err);
      setError(DEFAULT_SELECTOR_CONFIGS.group.errorMessage);
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
          <option value="">{loading ? DEFAULT_SELECTOR_CONFIGS.group.loadingMessage : placeholder}</option>
        )}
        
        {zones.map((zone) => (
          <option key={zone.value} value={zone.value}>
            {zone.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
      
      {loading && (
        <small className="text-muted">{DEFAULT_SELECTOR_CONFIGS.group.loadingMessage}</small>
      )}
    </div>
  );
};

export default ZoneSelector;