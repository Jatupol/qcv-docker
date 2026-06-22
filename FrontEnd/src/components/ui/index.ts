// ===== CLIENT SIDE =====
// client/src/components/ui/
// Export all UI components for clean imports - Complete Separation

// Base UI Components
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Modal } from './Modal';
export { default as Card } from './Card';

// Loading States
export { default as Loading } from './Loading';
export { default as LoadingOverlay } from './LoadingOverlay';
export { default as LoadingSpinner } from './LoadingSpinner';

// Data Display
export { default as EmptyState } from './EmptyState';
export { default as Pagination } from './Pagination';

// User Input
export { default as SearchInput } from './SearchInput';

// Feedback
export { default as Toast } from './Toast';

/*
=== UI COMPONENTS INDEX FEATURES ===

CLEAN IMPORTS:
✅ Single import source for all UI components
✅ Consistent import pattern across the app
✅ Tree-shakable exports for better bundle size
✅ Resolves "Failed to resolve import ../ui" errors

USAGE EXAMPLES:
```typescript
// Import multiple components
import { Button, Input, Modal, LoadingSpinner } from '../ui';

// Import specific component
import Button from '../ui/Button';

// In DefectForm.tsx or any component
import { Button, Input, Select, Modal } from '../ui';
```

COMPONENT CATEGORIES:
✅ Base UI: Button, Input, Select, Modal, Card
✅ Loading: Loading, LoadingOverlay, LoadingSpinner  
✅ Data Display: EmptyState, Pagination
✅ User Input: SearchInput
✅ Feedback: Toast

BENEFITS:
✅ Resolves import path issues across all components
✅ Centralized component exports
✅ Consistent with project structure
✅ Follows TypeScript best practices
✅ Easy to maintain and extend

IMPORT PATH RESOLUTION:
- From defects/: import { Button } from '../ui' ✅
- From common/: import { Modal } from '../ui' ✅  
- From pages/: import { Button } from '../../components/ui' ✅
- Direct imports: import Button from './ui/Button' ✅

This index file resolves the "Failed to resolve import ../ui" 
error by providing proper export declarations for all UI 
components used throughout the project.
*/