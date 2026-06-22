// client/src/components/selectors/SiteSelector.tsx

import React, { useState, useEffect } from 'react';
import { siteService } from '../../services/siteService';
import { convertDropdownOptionsToBaseOptions } from '../../utils/convertUtils';
import { 
  type SiteOption, 
  type SiteSelectorProps,
  DEFAULT_SELECTOR_CONFIGS
} from '../../types/sysconfig';

export const SiteSelector: React.FC<SiteSelectorProps> = ({
  value,
  onChange,
  placeholder = DEFAULT_SELECTOR_CONFIGS.site.placeholder,
  multiple = false,
  disabled = false,
  className = "",
  label,
  required = false
}) => {
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await siteService.getSites();
      
      // Convert DropdownOption[] to SiteOption[] using centralized utility
      const siteOptions = convertDropdownOptionsToBaseOptions(response.data || []);
      setSites(siteOptions);
    } catch (err) {
      console.error('Error loading sites:', err);
      setError(DEFAULT_SELECTOR_CONFIGS.site.errorMessage);
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
            {loading ? DEFAULT_SELECTOR_CONFIGS.site.loadingMessage : placeholder}
          </option>
        )}
        
        {sites.map((site) => (
          <option key={site.value} value={site.value}>
            {site.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
      
      {loading && (
        <small className="text-muted">{DEFAULT_SELECTOR_CONFIGS.site.loadingMessage}</small>
      )}
    </div>
  );
};

export default SiteSelector;