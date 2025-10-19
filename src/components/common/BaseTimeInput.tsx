import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TimeInputProps {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  variant?: 'outlined' | 'filled' | 'plain';
  error?: boolean;
  hint?: string;
  persistentHint?: boolean;
  dense?: boolean;
  loading?: boolean;
  clearable?: boolean;
  useCurrentTime?: boolean;
  value?: string | null;
  onChange?: (value: string | null) => void;
  min?: string | null; // Add min time constraint
  max?: string | null; // Add max time constraint,
  inputClassName?: string;
}

const normalizeTimeFormat = (timeValue: string | null): string => {
  if (!timeValue) return '';
  
  // Handle HH:MM:SS format by removing seconds
  if (timeValue.split(':').length === 3) {
    return timeValue.split(':').slice(0, 2).join(':');
  }
  return timeValue;
};

const BaseTimeInput: React.FC<TimeInputProps> = ({
  label,
  placeholder = "HH:mm",
  disabled = false,
  variant = "outlined",
  error = false,
  hint = "",
  persistentHint = false,
  dense = false,
  loading = false,
  clearable = true,
  useCurrentTime = false,
  value,
  inputClassName = "",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange = () => {},
  min = null,
  max = null,
}) => {
  // Normalize value to HH:MM format
  const normalizedValue = value ? normalizeTimeFormat(value) : value;
  
  // State
  const [inputValue, setInputValue] = useState<string>(normalizedValue || "");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'hours' | 'minutes'>('hours');
  
  // Refs
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const {t} = useTranslation();
  
  // Initialize with current time if requested and no value provided
  useEffect(() => {
    if (useCurrentTime && (!value || value === "")) {
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setInputValue(timeString);
      onChange(timeString);
    } else if (value) {
      // Ensure we normalize any HH:MM:SS format to HH:MM
      const normalizedTime = normalizeTimeFormat(value);
      setInputValue(normalizedTime);
    }
  }, [useCurrentTime, value, onChange]);
  
  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
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
  
  // Scroll to current hour/minute when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (timeRegex.test(inputValue)) {
        const [hours, minutes] = inputValue.split(':').map(Number);
        
        setTimeout(() => {
          if (hoursRef.current) {
            const hourElement = hoursRef.current.querySelector(`[data-hour="${hours}"]`);
            hourElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
          
          if (minutesRef.current) {
            const minuteElement = minutesRef.current.querySelector(`[data-minute="${minutes}"]`);
            minuteElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [isOpen, inputValue]);
  
  // Helper functions for time validation and comparison
  const isValidTime = (timeString: string | null): boolean => {
    if (!timeString) return false;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(timeString);
  };

  const parseTime = (timeString: string | null): { hours: number, minutes: number } | null => {
    if (!isValidTime(timeString)) return null;
    const [hours, minutes] = timeString!.split(':').map(Number);
    return { hours, minutes };
  };

  const compareTime = (time1: string, time2: string): number => {
    const t1 = parseTime(time1);
    const t2 = parseTime(time2);
    if (!t1 || !t2) return 0;
    
    if (t1.hours !== t2.hours) {
      return t1.hours - t2.hours;
    }
    return t1.minutes - t2.minutes;
  };

  const isTimeInRange = (timeStr: string): boolean => {
    if (!isValidTime(timeStr)) return true;
    
    const minTime = parseTime(min);
    const maxTime = parseTime(max);
    
    if (minTime && compareTime(timeStr, min!) < 0) return false;
    if (maxTime && compareTime(timeStr, max!) > 0) return false;
    
    return true;
  };
  
  // Apply input mask for HH:mm format
  const formatTimeInput = (val: string): string => {
    // Remove any non-digit characters
    const digitsOnly = val.replace(/\D/g, '');
    
    if (digitsOnly.length === 0) return '';
    
    if (digitsOnly.length <= 2) {
      // Check if hour is valid (00-23)
      const hour = parseInt(digitsOnly);
      if (hour > 23) return '23'; 
      return digitsOnly;
    }
    
    // Format with separator
    const hour = digitsOnly.substring(0, 2);
    const minute = digitsOnly.substring(2, 4);
    
    // Validate hour
    const hourVal = parseInt(hour);
    const validHour = hourVal <= 23 ? hour : '23';
    
    // Validate minute
    let validMinute = minute;
    if (minute.length > 0) {
      const minuteVal = parseInt(minute);
      validMinute = minuteVal <= 59 ? minute : '59';
    }
    
    // Add validation for min/max after formatting
    if (validMinute.length > 0) {
      const formattedTime = `${validHour}:${validMinute}`;
      // If time is out of range, clamp to min/max
      if (isValidTime(min) && compareTime(formattedTime, min!) < 0) {
        return min!;
      }
      if (isValidTime(max) && compareTime(formattedTime, max!) > 0) {
        return max!;
      }
      return formattedTime;
    }
    
    return `${validHour}${validMinute.length > 0 ? ':' + validMinute : ''}`;
  };
  
  // Event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatTimeInput(raw);
    setInputValue(formatted);
    
    // Only update if we have a valid time
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(formatted)) {
      onChange(formatted);
    }
  };
  
  const handleInputBlur = () => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    
    // Complete partial input on blur
    if (inputValue.length === 1 || inputValue.length === 2) {
      const paddedHour = inputValue.padStart(2, '0');
      let fullTime = `${paddedHour}:00`;
      
      // Check if the completed time is within range
      if (isValidTime(min) && compareTime(fullTime, min!) < 0) {
        fullTime = min!;
      } else if (isValidTime(max) && compareTime(fullTime, max!) > 0) {
        fullTime = max!;
      }
      
      setInputValue(fullTime);
      onChange(fullTime);
    } else if (!timeRegex.test(inputValue)) {
      // Reset invalid input
      setInputValue(value || '');
    } else if (!isTimeInRange(inputValue)) {
      // If time is out of range, clamp to min/max
      if (isValidTime(min) && compareTime(inputValue, min!) < 0) {
        setInputValue(min!);
        onChange(min);
      } else if (isValidTime(max) && compareTime(inputValue, max!) > 0) {
        setInputValue(max!);
        onChange(max);
      }
    }
  };
  
  const handleSelectClick = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
    }
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    onChange(null);
  };
  
  const handleHourSelect = (hour: number) => {
    let minutes = "00";
    
    // Extract minutes from current value if valid
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(inputValue)) {
      minutes = inputValue.split(':')[1];
    }
    
    let newTime = `${hour.toString().padStart(2, '0')}:${minutes}`;
    
    // Check if the new time is within range, or adjust the minutes to make it valid
    const minTime = parseTime(min);
    const maxTime = parseTime(max);
    
    if (minTime && hour === minTime.hours && parseInt(minutes) < minTime.minutes) {
      minutes = minTime.minutes.toString().padStart(2, '0');
      newTime = `${hour.toString().padStart(2, '0')}:${minutes}`;
    } else if (maxTime && hour === maxTime.hours && parseInt(minutes) > maxTime.minutes) {
      minutes = maxTime.minutes.toString().padStart(2, '0');
      newTime = `${hour.toString().padStart(2, '0')}:${minutes}`;
    }
    
    setInputValue(newTime);
    onChange(newTime);
    
    // Auto-advance to minutes on desktop
    if (!isMobile) {
      setActiveSection('minutes');
    }
  };
  
  const handleMinuteSelect = (minute: number) => {
    let hours = "00";
    
    // Extract hours from current value if valid
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(inputValue)) {
      hours = inputValue.split(':')[0];
    }
    
    const newTime = `${hours}:${minute.toString().padStart(2, '0')}`;
    
    // Check if the new time is within range
    if (!isTimeInRange(newTime)) {
      // If out of range, do not update
      return;
    }
    
    setInputValue(newTime);
    onChange(newTime);
    
    // Close dropdown on desktop after selecting minute
    if (!isMobile) {
      setTimeout(() => setIsOpen(false), 200);
    }
  };
  
  const handleConfirm = () => {
    setIsOpen(false);
  };
  
  // Generate hours and minutes for picker with filtering based on min/max
  const getFilteredHours = (): number[] => {
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    
    if (!isValidTime(min) && !isValidTime(max)) return allHours;
    
    return allHours.filter(hour => {
      const minTime = parseTime(min);
      const maxTime = parseTime(max);
      
      // If we have a minimum time, filter out hours less than the min hour
      if (minTime && hour < minTime.hours) return false;
      
      // If we have a maximum time, filter out hours greater than the max hour
      if (maxTime && hour > maxTime.hours) return false;
      
      return true;
    });
  };
  
  const getFilteredMinutes = (selectedHour: number): number[] => {
    const allMinutes = Array.from({ length: 60 }, (_, i) => i);
    
    if (!isValidTime(min) && !isValidTime(max)) return allMinutes;
    
    const minTime = parseTime(min);
    const maxTime = parseTime(max);
    
    return allMinutes.filter(minute => {
      // If hour is the min hour, filter minutes less than min minutes
      if (minTime && selectedHour === minTime.hours && minute < minTime.minutes) return false;
      
      // If hour is the max hour, filter minutes greater than max minutes
      if (maxTime && selectedHour === maxTime.hours && minute > maxTime.minutes) return false;
      
      return true;
    });
  };
  
  // Parse current hour and minute
  const getCurrentHour = (): number => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(inputValue)) {
      return parseInt(inputValue.split(':')[0]);
    }
    return -1;
  };
  
  const getCurrentMinute = (): number => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(inputValue)) {
      return parseInt(inputValue.split(':')[1]);
    }
    return -1;
  };
  
  // Determine variant styling (following the BaseSelect pattern)
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
  
  const hours = getFilteredHours();
  const currentHour = getCurrentHour();
  const minutes = getFilteredMinutes(currentHour);

  // Render time picker dropdown/dialog
  const renderTimePicker = () => {
    return (
      <>
      <div 
        className={`
          ${isMobile 
            ? 'fixed inset-0 z-[100] flex flex-col bg-white dark:bg-darkthemeitems w-[80%] h-[60%] gt-sm:w-[70%] gt-sm:h-[50vh] m-auto rounded-[10px] shadow-lg' 
            : 'absolute mt-1 rounded-[10px] shadow-lg z-[100] border border-[#88AB6130] bg-white dark:bg-darkthemeitems w-full'}
        `}
      >
        {/* Mobile header */}
        {isMobile && (
          <div className="flex items-center justify-between px-2 py-1 border-b border-[#88AB6130]">
            <h2 className="text-lg font-medium text-black dark:text-textdarktheme">{t('common.selectTime')}</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-softgreytheme dark:hover:bg-bgdarktheme2"
            >
              <X size={24} className="text-subblack dark:text-textdarktheme" />
            </button>
          </div>
        )}
        
        {/* Time selection container */}
        <div className={`flex ${isMobile ? 'flex-1 overflow-hidden' : 'h-60'}`}>
          {/* Hours column */}
          <div 
            ref={hoursRef}
            className={`overflow-y-auto flex-1 scrollbar-hide ${
              activeSection === 'hours' ? 'bg-softgreytheme dark:bg-bgdarktheme2' : ''
            }`}
            onClick={() => setActiveSection('hours')}
          >
            <div className="text-center p-2 text-sm text-subblack dark:text-textdarktheme sticky top-0 bg-white dark:bg-darkthemeitems border-b border-[#88AB6130]">
              {t('common.hour')}
            </div>
            <div className="py-2">
              {hours.map(hour => {
                const isSelected = hour === getCurrentHour();
                return (
                  <div
                    key={`hour-${hour}`}
                    data-hour={hour}
                    className={`
                      px-3 py-2 text-center cursor-pointer 
                      ${isSelected 
                        ? 'bg-softgreentheme text-greentheme dark:bg-greentheme dark:text-textdarktheme font-medium' 
                        : 'text-subblack dark:text-textdarktheme hover:bg-softgreytheme dark:hover:bg-bgdarktheme2'}
                    `}
                    onClick={() => handleHourSelect(hour)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Minutes column */}
          <div 
            ref={minutesRef}
            className={`overflow-y-auto flex-1 scrollbar-hide ${
              activeSection === 'minutes' ? 'bg-softgreytheme dark:bg-bgdarktheme2' : ''
            } ${isMobile ? 'border-l border-[#88AB6130]' : ''}`}
            onClick={() => setActiveSection('minutes')}
          >
            <div className="text-center p-2 text-sm text-subblack dark:text-textdarktheme sticky top-0 bg-white dark:bg-darkthemeitems border-b border-[#88AB6130]">
              {t('common.minute')}
            </div>
            <div className="py-2">
              {minutes.map(minute => {
                const isSelected = minute === getCurrentMinute();
                return (
                  <div
                    key={`minute-${minute}`}
                    data-minute={minute}
                    className={`
                      px-3 py-2 text-center cursor-pointer 
                      ${isSelected 
                        ? 'bg-softgreentheme text-greentheme dark:bg-greentheme dark:text-textdarktheme font-medium' 
                        : 'text-subblack dark:text-textdarktheme hover:bg-softgreytheme dark:hover:bg-bgdarktheme2'}
                    `}
                    onClick={() => handleMinuteSelect(minute)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Mobile footer with confirm button */}
        {isMobile && (
          <div className="p-4 border-t border-[#88AB6130]">
            <button
              onClick={handleConfirm}
              className="w-full py-2 px-4 bg-greentheme text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-softgreentheme"
            >
              {t('common.confirm')}
            </button>
          </div>
        )}
      </div>
      </>
    );
  };
  
  // Add a CSS class to hide scrollbars but maintain functionality
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Main component render
  return (
    <div className="relative w-full" ref={selectRef}>
      {/* Label */}
      {label && (
        <label 
          className={`block text-sm font-medium mb-1 ${
            error ? 'text-redtheme' : 'text-black dark:text-textdarktheme'
          }`}
        >
          {label}
        </label>
      )}
      
      {/* Select Field */}
      <div
        className={`
          ${getVariantClasses()}
          ${error ? 'border-redtheme' : 'hover:border-greentheme'}
          ${isOpen ? 'ring-2 ring-softgreentheme border-greentheme' : ''}
          ${dense ? 'py-1' : 'py-2'}
          px-3 rounded-[10px] relative transition duration-200 text-black dark:text-textdarktheme
          ${loading || disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${inputClassName}
        `}
        onClick={handleSelectClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center w-full">
            <Clock size={18} className="text-subblack dark:text-textdarktheme mr-2" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              disabled={disabled}
              className="outline-none bg-transparent w-full text-black dark:text-textdarktheme"
            />
          </div>
          
          {/* Loading Spinner, Clear and Dropdown Icons */}
          <div className="flex items-center ml-2">
            {loading ? (
              <Loader2 
                size={16} 
                className="text-greentheme dark:text-textdarktheme animate-spin" 
              />
            ) : (
              <>
                {clearable && inputValue && (
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
      
      {/* Time Picker Dropdown */}
      {isOpen && !loading && renderTimePicker()}
    </div>
  );
};

export default BaseTimeInput;