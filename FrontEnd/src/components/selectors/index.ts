// client/src/components/selectors/index.ts
// Centralized exports for all selector components

// Base components and types
export { default as BaseSelector } from './BaseSelector';
export * from './types/BaseSelectorTypes';
export * from './configs/SelectorConfigs';

// SERIAL ID Entity Selectors (Pattern 1)
export { default as DefectSelector } from './DefectSelector';
export { default as DefectTypeSelector } from './DefectTypeSelector';
export { default as ModelSelector } from './ModelSelector';
export { default as ProductFamilySelector } from './ProductFamilySelector';
export { default as SamplingReasonSelector } from './SamplingReasonSelector';

// VARCHAR CODE Entity Selectors (Pattern 2)
export { default as CustomerSelector } from './CustomerSelector';
export { default as SiteSelector } from './SiteSelector';
export { default as LineMCSelector } from './LineMCSelector';

// Type exports for convenience
export type { SerialIdSelectorProps, VarcharCodeSelectorProps } from './types/BaseSelectorTypes';

// Configuration exports
export {
  defectSelectorConfig,
  defectTypeSelectorConfig,
  modelSelectorConfig,
  productFamilySelectorConfig,
  samplingReasonSelectorConfig,
  customerSelectorConfig,
  siteSelectorConfig,
  lineMCSelectorConfig,
  getSelectorConfig
} from './configs/SelectorConfigs';