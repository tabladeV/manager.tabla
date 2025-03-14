import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Loader2 } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  multiple?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  chips?: boolean;
  searchable?: boolean;
  variant?: 'outlined' | 'filled' | 'plain';
  error?: boolean;
  hint?: string;
  persistentHint?: boolean;
  dense?: boolean;
  loading?: boolean;
  value?: string | number | (string | number)[] | null;
  onChange?: (value: string | number | (string | number)[] | null) => void;
}

const BaseSelect: React.FC<SelectProps> = ({
  label,
  placeholder = "Select an option",
  options = [],
  multiple = false,
  clearable = true,
  disabled = false,
  chips = false,
  searchable = false,
  variant = "outlined",
  error = false,
  hint = "",
  persistentHint = false,
  dense = false,
  loading = false,
  value,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange = () => {},
}) => {
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
    multiple 
      ? Array.isArray(value) ?  (value as (string | number)[]) : [] 
      : value !== undefined && value !== null ? [value as string | number] : []
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal state when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValues(
        multiple 
          ? Array.isArray(value) ? value : [] 
          : value !== null ? [value as string | number] : []
      );
    }
  }, [value, multiple]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle display value
  const displayValue = (): string => {
    if (selectedValues.length === 0) {
      return placeholder;
    }

    if (chips) {
      return placeholder;
    }

    if (multiple) {
      return `${selectedValues.length} selected`;
    } else {
      const selected = options.find(opt => opt.value === selectedValues[0]);
      return selected ? selected.label : placeholder;
    }
  };

  // Handle option selection
  const handleSelect = (value: string | number): void => {
    let newValues: (string | number)[];
    
    if (multiple) {
      newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
    } else {
      newValues = [value];
      setIsOpen(false);
    }
    
    setSelectedValues(newValues);
    onChange(multiple ? newValues : newValues[0]);
  };

  // Clear selection
  const handleClear = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setSelectedValues([]);
    onChange(multiple ? [] : null);
  };

  // Handle search filtering
  const filteredOptions = searchable && searchTerm
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  // Focus the search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Determine variant styling
  const getVariantClasses = (): string => {
    switch (variant) {
      case "filled":
        return "bg-softgreytheme dark:bg-darkthemeitems";
      case "plain":
        return "border-none shadow-none";
      case "outlined":
      default:
        return "bg-white dark:bg-darkthemeitems border border-[#88AB6130]";
    }
  };

  return (
    <div 
      className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      ref={selectRef}
    >
      {/* Label */}
      {label && (
        <label 
          className={`block text-sm font-medium mb-1 ${error ? 'text-redtheme' : 'text-balck dark:text-textdarktheme'}`}
        >
          {label}
        </label>
      )}
      
      {/* Select Field - using inputs class from your CSS */}
      <div
        className={`
          ${getVariantClasses()}
          ${error ? 'border-redtheme' : 'hover:border-greentheme'}
          ${isOpen ? 'ring-2 ring-softgreentheme border-greentheme' : ''}
          ${dense ? 'py-1' : 'py-2'}
          px-3 rounded-[10px] cursor-pointer relative transition duration-200 text-black dark:text-textdarktheme
          ${loading || disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          {/* Selected Chips */}
          {chips && selectedValues.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-w-full">
              {selectedValues.map(value => {
                const opt = options.find(o => o.value === value);
                return (
                  <div 
                    key={String(value)} 
                    className="bg-softgreentheme text-greentheme dark:text-textdarktheme dark:bg-greentheme rounded-full px-2 py-1 text-xs flex items-center"
                  >
                    <span className="mr-1">{opt?.label}</span>
                    <X 
                      size={14} 
                      className="cursor-pointer" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(value);
                      }}
                    />
                  </div>
                );
              })}
              {/* Display placeholder if needed alongside chips */}
              {searchable && isOpen && (
                <input
                  ref={inputRef}
                  className="outline-none bg-transparent flex-grow min-w-[50px] dark:text-textdarktheme"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={selectedValues.length === 0 ? placeholder : ""}
                />
              )}
            </div>
          ) : (
            <>
              {/* Display Value or Search Input */}
              {searchable && isOpen ? (
                <input
                  ref={inputRef}
                  className="outline-none bg-transparent w-full dark:text-textdarktheme"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={placeholder}
                />
              ) : (
                <div className="truncate">{displayValue()}</div>
              )}
            </>
          )}
          
          {/* Loading Spinner, Clear and Dropdown Icons */}
          <div className="flex items-center ml-2">
            {loading ? (
              <Loader2 
                size={16} 
                className="text-greentheme dark:text-textdarktheme animate-spin" 
              />
            ) : (
              <>
                {clearable && selectedValues.length > 0 && (
                  <X 
                    size={16} 
                    className="text-subblack dark:text-textdarktheme hover:text-blacktheme dark:hover:text-white mr-1" 
                    onClick={handleClear}
                  />
                )}
                <ChevronDown 
                  size={16} 
                  className={`text-subblack dark:text-textdarktheme transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
                />
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Hint Text */}
      {(hint && (persistentHint || error)) && (
        <div className={`text-xs mt-1 ${error ? 'text-redtheme' : 'text-subblack dark:text-textdarktheme'}`}>
          {hint}
        </div>
      )}
      
      {/* Dropdown */}
      {isOpen && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-darkthemeitems border border-[#88AB6130] rounded-[10px] shadow-lg max-h-60 overflow-auto bar-hide">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-subblack dark:text-textdarktheme">No options available</div>
          ) : (
            <ul className="py-1">
              {filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <li
                    key={String(option.value)}
                    className={`
                      px-4 py-2 flex items-center justify-between text-sm cursor-pointer
                      ${option.disabled ? 'opacity-50 pointer-events-none' : ''}
                      ${isSelected ? 'bg-softgreentheme text-greentheme dark:bg-greentheme dark:text-textdarktheme' : 'text-subblack dark:text-textdarktheme'}
                      hover:bg-softgreytheme dark:hover:bg-bgdarktheme2
                    `}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={16} className="text-greentheme dark:text-textdarktheme" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default BaseSelect;