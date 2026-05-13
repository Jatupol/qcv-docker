// client/src/components/selectors/GroupSelector.tsx

import React, { useState, useEffect } from 'react';
import { groupService } from '../../services/groupService';
import { convertDropdownOptionsToBaseOptions } from '../../utils/convertUtils';
import { 
  type GroupOption, 
  type GroupSelectorProps,
  DEFAULT_SELECTOR_CONFIGS
} from '../../types/sysconfig';


export const GroupSelector: React.FC<GroupSelectorProps> = ({
  value,
  onChange,
  placeholder = DEFAULT_SELECTOR_CONFIGS.group.placeholder,
  multiple = false,
  disabled = false,
  className = "",
  label,
  required = false
}) => {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupService.getGroups();
      
      // Convert DropdownOption[] to GroupOption[] using centralized utility
      const groupOptions = convertDropdownOptionsToBaseOptions(response.data || []);
      setGroups(groupOptions);
    } catch (err) {
      console.error('Error loading groups:', err);
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
          <option value="">
            {loading ? DEFAULT_SELECTOR_CONFIGS.group.loadingMessage : placeholder}
          </option>
        )}
        
        {groups.map((group) => (
          <option key={group.value} value={group.value}>
            {group.label}
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

export default GroupSelector;