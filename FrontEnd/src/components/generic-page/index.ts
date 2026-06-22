// client/src/components/generic-page/index.ts
// Export all Entity Page Components
// Complete Separation Entity Architecture - Component aggregation

// NEW: Universal entity components (renamed from Code* to Entity*)
export { default as EntityPageHeader } from './EntityPageHeader';
export { default as EntitySearchControls } from './EntitySearchControls';
export { default as EntityDataTable } from './EntityDataTable';

// LEGACY: Keep old exports for backward compatibility
export { default as CodePageHeader } from './EntityPageHeader'; // Alias for backward compatibility
export { default as CodeSearchControls } from './EntitySearchControls'; // Alias for backward compatibility  
export { default as CodeDataTable } from './EntityDataTable'; // Alias for backward compatibility

// Re-export types for convenience
export type { EntityStats, EntityPageHeaderProps } from './EntityPageHeader';
export type { SearchConfig, FilterOption, EntitySearchControlsProps } from './EntitySearchControls';
export type { TableColumn, EntityDataTableProps } from './EntityDataTable';

// Legacy type exports for backward compatibility
export type { EntityStats as CodePageHeaderEntityStats, EntityPageHeaderProps as CodePageHeaderProps } from './EntityPageHeader';
export type { SearchConfig as CodeSearchConfig, FilterOption as CodeFilterOption, EntitySearchControlsProps as CodeSearchControlsProps } from './EntitySearchControls';
export type { TableColumn as CodeTableColumn, EntityDataTableProps as CodeDataTableProps } from './EntityDataTable';