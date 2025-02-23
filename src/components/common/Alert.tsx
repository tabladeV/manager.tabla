import { useState, ReactNode } from 'react';
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';

type AlertType = 'info' | 'success' | 'warning' | 'error';
type AlertVariant = 'filled' | 'outline';

interface AlertProps {
  type?: AlertType;
  variant?: AlertVariant;
  children: ReactNode;
}

const alertStyles = {
  filled: {
    base: 'flex rounded-lg p-4 mb-4 text-sm transition-all duration-300 ease-in-out',
    variants: {
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-200 dark:text-blue-800',
      success: 'bg-green-100 text-green-700 dark:bg-green-200 dark:text-green-800',
      warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-200 dark:text-yellow-800',
      error: 'bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-800',
    },
  },
  outline: {
    base: 'flex rounded-lg p-4 mb-4 text-sm border transition-all duration-300 ease-in-out',
    variants: {
      info: 'border-blue-700 text-blue-700 dark:border-blue-200 dark:text-blue-200',
      success: 'border-green-700 text-green-700 dark:border-green-200 dark:text-green-200',
      warning: 'border-yellow-700 text-yellow-700 dark:border-yellow-200 dark:text-yellow-200',
      error: 'border-red-700 text-red-700 dark:border-red-200 dark:text-red-200',
    },
  },
};

const icons = {
  info: <Info className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
};

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  variant = 'filled',
  children,
}) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const style = alertStyles[variant].variants[type];
  const baseStyle = alertStyles[variant].base;
  const Icon = icons[type];

  return (
    <div className={`${baseStyle} ${style}`} role="alert">
      {Icon}
      <div className="ml-3 flex-1">{children}</div>
      <button
        className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
        onClick={() => setVisible(false)}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Alert;
