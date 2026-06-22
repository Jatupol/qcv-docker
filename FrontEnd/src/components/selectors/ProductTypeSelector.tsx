// client/src/components/selectors/ProductTypeSelector.tsx

import React, { useState, useEffect } from 'react';
import { productTypeService } from '../../services/productTypeService';

import { convertDropdownOptionsToBaseOptions } from '../../utils/convertUtils';
import { 
  type ProductTypeOption, 
  type ProductTypeSelectorProps,
  DEFAULT_SELECTOR_CONFIGS
} from '../../types/sysconfig';
 

export const ProductTypeSelector: React.FC<ProductTypeSelectorProps> = ({
  value,
  onChange,
  placeholder = DEFAULT_SELECTOR_CONFIGS.group.placeholder,
  multiple = false,
  disabled = false,
  className = "",
  label,
  required = false
}) => {
  const [productTypes, setProductTypes] = useState<ProductTypeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductTypes();
  }, []);

  const loadProductTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productTypeService.getProductTypes();
      
      // Convert DropdownOption[] to ProductTypeOption[] to ensure code is always string
      const productTypeOptions = convertDropdownOptionsToBaseOptions(response.data || []);
      
      setProductTypes(productTypeOptions);
    } catch (err) {
      console.error('Error loading product types:', err);
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
        
        {productTypes.map((productType) => (
          <option key={productType.value} value={productType.value}>
            {productType.label}
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

export default ProductTypeSelector;