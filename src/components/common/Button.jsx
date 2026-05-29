/**
 * Button — reusable button component with variant, size, and loading support.
 *
 * Variants: primary | secondary | ghost | danger
 * Sizes:    sm | md | lg
 */
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:   'bg-primary-600 hover:bg-primary-700 text-white shadow-sm disabled:bg-gray-200 disabled:text-gray-500 hover:scale-105',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm disabled:opacity-40',
  ghost:     'text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:opacity-40',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-7 py-3 text-base rounded-lg',
};

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${SIZES[size]     ?? SIZES.md}
        ${className}
      `}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
