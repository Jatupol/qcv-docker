// client/src/components/selectors/TabSelector.tsx

import React, { useState, useEffect } from 'react';
import { tabService } from '../../services/tabService';

import { convertDropdownOptionsToBaseOptions } from '../../utils/convertUtils';
import { 
  type TabOption, 
  type TabSelectorProps,
  DEFAULT_SELECTOR_CONFIGS
} from '../../types/sysconfig';
 

export const TabSelector: React.FC<TabSelectorProps> = ({
  value,
  onChange,
  placeholder = DEFAULT_SELECTOR_CONFIGS.group.placeholder,
  multiple = false,
  disabled = false,
  className = "",
  label,
  required = false
}) => {
  const [tabs, setTabs] = useState<TabOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTabs();
  }, []);

  const loadTabs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tabService.getTabs();
      
      // Convert DropdownOption[] to TabOption[] to ensure code is always string
      const tabOptions = convertDropdownOptionsToBaseOptions(response.data || []);      
      setTabs(tabOptions);
    } catch (err) {
      console.error('Error loading tabs:', err);
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
        
        {tabs.map((tab) => (
          <option key={tab.value} value={tab.value}>
            {tab.label}
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

export default TabSelector;