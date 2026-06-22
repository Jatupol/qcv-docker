// client/src/components/selectors/SamplingReasonSelector.tsx
import React from 'react';
import BaseSelector from './BaseSelector';
import { samplingReasonSelectorConfig } from './configs/SelectorConfigs';
import type { SerialIdSelectorProps } from './types/BaseSelectorTypes';
import type { SamplingReason } from '../../services/samplingReasonService';

interface SamplingReasonSelectorProps extends SerialIdSelectorProps {
  onSamplingReasonLoad?: (samplingReasons: SamplingReason[]) => void;
}

const SamplingReasonSelector: React.FC<SamplingReasonSelectorProps> = (props) => {
  return <BaseSelector config={samplingReasonSelectorConfig} {...props} />;
};

export default SamplingReasonSelector;