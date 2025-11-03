import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Loader2 } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

type ValidationRule = (value: string | number | (string | number)[] | null) => string | null;

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  multiple?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  readonly?: boolean;
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
  rules?: ValidationRule[];
  name?: string;
}

const BaseSelect: React.FC<SelectProps> = ({
  label,
  placeholder = "Select an option",
  options = [],
  multiple = false,
  clearable = true,
  disabled = false,
  readonly = false,
  chips = false,
  searchable = false,
  variant = "outlined",
  error: propError = false,
  hint = "",
  persistentHint = false,
  dense = false,
  loading = false,
  value,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange = () => {},
  rules = [],
  name,
}) => {
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
    multiple 
      ? Array.isArray(value) ?  (value as (string | number)[]) : [] 
      : value !== undefined && value !== null ? [value as string | number] : []
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const error = propError || errors.length > 0;

  // Update internal state when external value changes
  useEffect(() => {
    if (value !== undefined) {
      const newSelectedValues = multiple 
          ? Array.isArray(value) ? value : [] 
          : value !== null ? [value as string | number] : [];
      setSelectedValues(newSelectedValues);
      if (touched) {
        validate(multiple ? newSelectedValues : newSelectedValues[0] ?? null);
      }
    }
  }, [value, multiple, touched]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (!touched) {
          setTouched(true);
          validate(multiple ? selectedValues : selectedValues[0] ?? null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [touched, selectedValues, multiple]);

  const validate = (currentValue: string | number | (string | number)[] | null) => {
    const validationErrors = rules
      .map((rule) => rule(currentValue))
      .filter((errorMessage): errorMessage is string => errorMessage !== null);
    setErrors(validationErrors);
  };

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
  const handleSelect = (selectedValue: string | number): void => {
    let newValues: (string | number)[];
    
    if (multiple) {
      newValues = selectedValues.includes(selectedValue)
        ? selectedValues.filter(v => v !== selectedValue)
        : [...selectedValues, selectedValue];
    } else {
      newValues = [selectedValue];
      setIsOpen(false);
      if (!touched) setTouched(true);
    }
    
    const newOnChangeValue = multiple ? newValues : newValues[0];
    setSelectedValues(newValues);
    onChange(newOnChangeValue);
    if (touched || !multiple) {
      validate(newOnChangeValue);
    }
  };

  // Clear selection
  const handleClear = (e: React.MouseEvent): void => {
    e.stopPropagation();
    const newOnChangeValue = multiple ? [] : null;
    setSelectedValues([]);
    onChange(newOnChangeValue);
    if (touched) {
      validate(newOnChangeValue);
    }
  };

  const handleOpen = () => {
    if (disabled || readonly || loading) return;
    setIsOpen(!isOpen);
    if (isOpen && !touched) { // on close
        setTouched(true);
        validate(multiple ? selectedValues : selectedValues[0] ?? null);
    }
  }

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
          htmlFor={name}
          className={`block text-sm font-medium mb-1 ${error ? 'text-redtheme' : 'text-balck dark:text-textdarktheme'}`}
        >
          {label}
        </label>
      )}
      
      {/* Select Field */}
      <div
        id={name}
        className={`
          ${getVariantClasses()}
          ${error ? 'border-redtheme' : 'hover:border-greentheme'}
          ${isOpen ? 'ring-2 ring-softgreentheme border-greentheme' : ''}
          ${dense ? 'py-1' : 'py-2'}
          px-3 rounded-[10px] relative transition duration-200 text-black dark:text-textdarktheme
          ${loading || disabled || readonly ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${readonly ? 'bg-gray-100 dark:bg-darkthemeitems' : ''}
        `}
        onClick={handleOpen}
        aria-readonly={readonly}
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
                        if (readonly) return;
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
                  readOnly={readonly}
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
                  readOnly={readonly}
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
                {clearable && selectedValues.length > 0 && !readonly && (
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
      {(hint && !error && (persistentHint || touched)) && (
        <div className={`text-xs mt-1 text-subblack dark:text-textdarktheme`}>
          {hint}
        </div>
      )}
      {errors.length > 0 && (
        <ul className="text-xs text-redtheme mt-1">
          {errors.map((err, index) => (
            <li key={index}>{err}</li>
          ))}
        </ul>
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