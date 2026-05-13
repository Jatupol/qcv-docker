// client/src/components/selectors/ProductFamilySelector.tsx

import React, { useState, useEffect } from 'react';
import { productFamilyService } from '../../services/productFamilyService';

import { convertDropdownOptionsToBaseOptions } from '../../utils/convertUtils';
import { 
  type ProductFamilyOption, 
  type ProductFamilySelectorProps,
  DEFAULT_SELECTOR_CONFIGS
} from '../../types/sysconfig';
 
export const ProductFamilySelector: React.FC<ProductFamilySelectorProps> = ({
  value,
  onChange,
  placeholder = DEFAULT_SELECTOR_CONFIGS.group.placeholder,
  multiple = false,
  disabled = false,
  className = "",
  label,
  required = false
}) => {
  const [productFamilies, setProductFamilies] = useState<ProductFamilyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductFamilies();
  }, []);

  const loadProductFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productFamilyService.getProductFamilys();
      
      // Convert DropdownOption[] to ProductFamilyOption[] to ensure code is always string
      const productFamilyOptions= convertDropdownOptionsToBaseOptions(response.data || []);
      
      setProductFamilies(productFamilyOptions);
    } catch (err) {
      console.error('Error loading product families:', err);
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
        
        {productFamilies.map((productFamily) => (
          <option key={productFamily.value} value={productFamily.value}>
            {productFamily.label}
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

export default ProductFamilySelector;