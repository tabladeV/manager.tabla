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

  const baseClasses = `
    w-full px-3 py-2
    ${variant === 'outlined' ? 'border' : 'border-b'}
    ${rounded ? `rounded-${rounded}` : ''}
    focus:outline-none
    transition-colors duration-300
  `;

  const colorClasses = errors.length > 0
    ? 'border-red-500 focus:border-red-500'
    : `border-gray-300 focus:border-${color}-500`;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-gray-700 mb-1" htmlFor={name}>
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
        className={`${baseClasses} ${colorClasses}`}
      />
      {hint && errors.length === 0 && (
        <p className="text-sm text-gray-500 mt-1">{hint}</p>
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
