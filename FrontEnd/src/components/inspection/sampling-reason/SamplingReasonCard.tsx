// client/src/components/inspection/sampling-reason/SamplingReasonCard.tsx
// Sampling Reason Card Component - UPDATED WITH HEROICONS
// Complete Separation Entity Architecture - Individual reason card display

import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  StarIcon 
} from '@heroicons/react/24/outline';
import { 
  type SamplingReason, 
  type SamplingReasonCardProps, 
  getCategoryColor, 
  getPriorityColor 
} from '../../../types/sampling-reason';

/**
 * Sampling Reason Card Component
 * Complete Separation Entity Architecture - Individual reason card display
 */

const SamplingReasonCard: React.FC<SamplingReasonCardProps> = ({
  reason,
  isSelected,
  onSelect,
  disabled = false
}) => {
  const handleClick = () => {
    if (!disabled) {
      onSelect(reason);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onSelect(reason);
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'high':
        return <StarIcon className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`
        w-full p-4 rounded-lg border text-left transition-all duration-200 
        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
        ${isSelected
          ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200 shadow-md'
          : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
        }
      `}
      aria-pressed={isSelected}
      aria-describedby={reason.description ? `reason-desc-${reason.id}` : undefined}
    >
      <div className="space-y-3">
        
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 truncate">
                {reason.name}
              </h3>
              {isSelected && (
                <CheckCircleIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
              )}
            </div>
            {reason.code && (
              <p className="text-sm text-gray-600 mt-1">
                Code: <span className="font-mono">{reason.code}</span>
              </p>
            )}
          </div>
          
          {/* Priority Icon */}
          {reason.priority && (
            <div className="flex-shrink-0 ml-2">
              {getPriorityIcon(reason.priority)}
            </div>
          )}
        </div>

        {/* Description */}
        {reason.description && (
          <div>
            <p 
              id={`reason-desc-${reason.id}`}
              className="text-sm text-gray-600 line-clamp-2"
            >
              {reason.description}
            </p>
          </div>
        )}

        {/* Badges Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Category Badge */}
            {reason.category && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(reason.category)}`}>
                {reason.category.charAt(0).toUpperCase() + reason.category.slice(1)}
              </span>
            )}
            
            {/* Priority Badge */}
            {reason.priority && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reason.priority)}`}>
                {reason.priority.charAt(0).toUpperCase() + reason.priority.slice(1)}
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            <div className={`
              w-2 h-2 rounded-full
              ${reason.isActive ? 'bg-green-500' : 'bg-red-500'}
            `} />
            <span className={`
              text-xs font-medium
              ${reason.isActive ? 'text-green-700' : 'text-red-700'}
            `}>
              {reason.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="mt-3 pt-3 border-t border-orange-200">
            <div className="flex items-center space-x-2 text-orange-700">
              <CheckCircleIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Selected for inspection</span>
            </div>
          </div>
        )}

        {/* Hover Effect Overlay */}
        {!disabled && (
          <div className={`
            absolute inset-0 rounded-lg transition-opacity duration-200 pointer-events-none
            ${isSelected 
              ? 'bg-orange-500 opacity-0' 
              : 'bg-orange-500 opacity-0 hover:opacity-5'
            }
          `} />
        )}
      </div>
    </button>
  );
};

export default SamplingReasonCard;