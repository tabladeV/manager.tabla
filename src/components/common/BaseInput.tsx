import React, { useState, ChangeEvent, FocusEvent } from 'react';
import { useDarkContext } from "../../context/DarkContext";

type ValidationRule = (value: string) => string | null;

interface BaseInputProps {
  label?: string;
  type?: string;
  variant?: 'filled' | 'outlined';
  color?: string;
  value: string;
  onChange?: (value: string) => void;
  hint?: string;
  name?: string;
  placeholder?: string;
  rounded?: string;
  className?: string;
  rules?: ValidationRule[];
  dense?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

const BaseInput: React.FC<BaseInputProps> = ({
  label,
  type = 'text',
  variant = 'filled',
  color = 'blue', // Default color set to 'blue'
  value,
  onChange,
  hint,
  name,
  placeholder,
  rounded = 'md', // Default rounded corners
  className,
  rules = [],
  dense = false,
  disabled = false,
  readonly = false,
}) => {
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { darkMode } = useDarkContext();

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    validate(e.target.value);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
    if (touched) {
      validate(newValue);
    }
  };

  const validate = (value: string) => {
    const validationErrors = rules
      .map((rule) => rule(value))
      .filter((errorMessage): errorMessage is string => errorMessage !== null);
    setErrors(validationErrors);
  };

  const getVariantClasses = () => {
    const padding = dense ? 'py-1 px-2' : 'py-2 px-3';
    const base = `w-full ${padding} focus:outline-none transition-colors duration-300`;
    const roundedClass = rounded ? `rounded-${rounded}` : '';

    let variantClasses = '';
    if (variant === 'outlined') {
      variantClasses = `border ${darkMode ? 'bg-darkthemeitems border-[#88AB6130] text-textdarktheme' : 'bg-white border-gray-300 text-black'}`;
    } else { // filled
      variantClasses = `border-b ${darkMode ? 'bg-darkthemeitems border-b-gray-600 text-textdarktheme' : 'bg-gray-100 border-b-gray-400 text-black'}`;
    }

    return `${base} ${roundedClass} ${variantClasses}`;
  };

  const getFocusClasses = () => {
    if (errors.length > 0) {
      return 'border-red-500 focus:border-red-500';
    }
    return darkMode
      ? `focus:border-greentheme`
      : `focus:border-${color}-500`;
  };

  const baseClasses = getVariantClasses();
  const colorClasses = getFocusClasses();
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const readonlyClasses = readonly ? 'bg-gray-100 dark:bg-darkthemeitems' : '';

  return (
    <div className={`${className}`}>
      {label && (
        <label className={`block mb-1 ${darkMode ? 'text-textdarktheme' : 'text-gray-700'}`} htmlFor={name}>
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${baseClasses} ${colorClasses} ${disabledClasses} ${readonlyClasses}`}
        disabled={disabled}
        readOnly={readonly}
        aria-readonly={readonly}
      />
      {hint && errors.length === 0 && (
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{hint}</p>
      )}
      {errors.length > 0 && (
        <ul className="text-sm text-red-500 mt-1">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BaseInput;