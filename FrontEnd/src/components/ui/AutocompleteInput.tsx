// client/src/components/ui/AutocompleteInput.tsx
// Reusable Autocomplete Input Component with Live Search

import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface AutocompleteOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Search...',
  className = '',
  error = false,
  disabled = false,
  label,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on input value
  useEffect(() => {
    if (value.trim() === '') {
      setFilteredOptions(options.slice(0, 10)); // Show first 10 when empty
    } else {
      const searchTerm = value.toLowerCase();
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm) ||
        option.value.toLowerCase().includes(searchTerm) ||
        (option.subtitle && option.subtitle.toLowerCase().includes(searchTerm))
      );
      setFilteredOptions(filtered.slice(0, 10)); // Limit to 10 results
    }
    setHighlightedIndex(-1);
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (option: AutocompleteOption) => {
    onChange(option.value);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Dropdown */}
      {isOpen && filteredOptions.length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredOptions.map((option, index) => (
            <div
              key={`${option.value}-${index}`}
              onClick={() => handleOptionClick(option)}
              className={`px-3 py-1.5 cursor-pointer transition-colors ${
                index === highlightedIndex
                  ? 'bg-primary-100 text-primary-900'
                  : 'hover:bg-gray-100'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === filteredOptions.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                  {option.subtitle && (
                    <div className="text-xs text-gray-500">{option.subtitle}</div>
                  )}
                </div>
                <div className="text-xs text-gray-400">{option.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message - Allow custom input */}
      {isOpen && filteredOptions.length === 0 && value.trim() !== '' && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3"
        >
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              No matches found for "{value}"
            </p>
            <div className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-xs text-blue-700 font-medium">
                ✓ Press Enter to use custom value
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
