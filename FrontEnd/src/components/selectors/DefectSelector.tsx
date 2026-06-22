// client/src/components/selectors/DefectSelector.tsx
// Simplified defect selector using generic base component

import React from 'react';
import BaseSelector from './BaseSelector';
import { defectSelectorConfig } from './configs/SelectorConfigs';
import type { SerialIdSelectorProps } from './types/BaseSelectorTypes';
import type { Defect } from '../../services/defectService';

interface DefectSelectorProps extends SerialIdSelectorProps {
  onDefectLoad?: (defects: Defect[]) => void;
}

const DefectSelector: React.FC<DefectSelectorProps> = (props) => {
  return (
    <BaseSelector
      config={defectSelectorConfig}
      {...props}
    />
  );
};

export default DefectSelector;

// Export helper hook for using defects in forms
export const useDefects = (includeInactive = false) => {
  // This hook can be implemented separately if needed
  // or you can use the BaseSelector's built-in loading logic
  return {
    // Implementation would go here if custom hook logic is needed
  };
};