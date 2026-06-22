// client/src/components/selectors/ProductFamilySelector.tsx
import React from 'react';
import BaseSelector from './BaseSelector';
import { productFamilySelectorConfig } from './configs/SelectorConfigs';
import type { SerialIdSelectorProps } from './types/BaseSelectorTypes';
import type { ProductFamily } from '../../services/productFamilyService';

interface ProductFamilySelectorProps extends SerialIdSelectorProps {
  onProductFamilyLoad?: (productFamilies: ProductFamily[]) => void;
}

const ProductFamilySelector: React.FC<ProductFamilySelectorProps> = (props) => {
  return <BaseSelector config={productFamilySelectorConfig} {...props} />;
};

export default ProductFamilySelector;