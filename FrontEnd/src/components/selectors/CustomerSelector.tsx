// client/src/components/selectors/CustomerSelector.tsx

import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import { 
  type Customer, 
  type CustomerSelectorProps,
  DEFAULT_SELECTOR_CONFIGS
} from '../../types/customer';

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  value,
  onChange,
  placeholder = DEFAULT_SELECTOR_CONFIGS.customer.placeholder,
  multiple = false,
  disabled = false,
  className = "",
  label,
  required = false,
  showInactive = false
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, [showInactive]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        limit: 1000, // Get all customers for dropdown
        ...(showInactive ? {} : { isActive: true }) // Filter inactive if needed
      };
      
      const response = await customerService.getCustomersSelector(queryParams);
      
      let data: Customer[] = [];
      if (response.success && response.data) {
        data = response.data;
      }

      // Additional client-side filtering for inactive if service doesn't support it
      if (!showInactive) {
        data = data.filter(customer => customer.is_active !== false);
      }

      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError(DEFAULT_SELECTOR_CONFIGS.customer.errorMessage);
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

  const formatDisplayName = (customer: Customer) => {
    const inactiveText = customer.is_active === false ? ' (Inactive)' : '';
    return `${customer.code} - ${customer.name}${inactiveText}`;
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
            {loading ? DEFAULT_SELECTOR_CONFIGS.customer.loadingMessage : placeholder}
          </option>
        )}
        
        {customers.map((customer) => (
          <option key={customer.code} value={customer.code}>
            {formatDisplayName(customer)}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
      
      {loading && (
        <small className="text-muted">{DEFAULT_SELECTOR_CONFIGS.customer.loadingMessage}</small>
      )}
    </div>
  );
};

export default CustomerSelector;