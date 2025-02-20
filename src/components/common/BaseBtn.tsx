import React from 'react';
import { LoaderCircle } from 'lucide-react';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode | null;
};

const baseStyles =
  'font-medium rounded-[10px] transition duration-200 focus:outline-none inline-flex items-center justify-center';

const variantStyles: Record<string, string> = {
  primary: 'bg-greentheme text-white hover:bg-[#688F3D]',
  secondary: 'bg-[#688F3D20] text-greentheme hover:bg-[#688F3D] hover:text-white',
  outlined: 'bg-transparent border border-[#688F3D] text-subblack hover:bg-[#688F3D] hover:text-white',
};

const sizeStyles: Record<string, string> = {
  small: 'py-1 px-3 text-sm',
  medium: 'py-2 px-4 text-base',
  large: 'py-3 px-5 text-lg',
};

const BaseBtn: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  children,
}) => {
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseStyles} ${variantClass} ${sizeClass} ${disabledClass} relative`}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClick={!loading ? onClick : () => {}}
      disabled={disabled || loading}
    >
      {loading && (
        <span className={`w-full h-full absolute`}>
            {/* <LoaderCircle className="animate-spin mr-2 absolute inset-0 m-auto" size={16} /> */}
                <LoaderCircle className="animate-spin absolute inset-0 m-auto" size={20} />
        </span>
      )}
      <div className={`${loading?'invisible':''}`}>{children}</div>
    </button>
  );
};

export default BaseBtn;
