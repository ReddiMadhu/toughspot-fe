/**
 * Spinner — inline loading spinner.
 *
 * Sizes: sm (16px) | md (24px) | lg (40px)
 * Colors: primary (default) | white | gray
 */
const SIZES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

const COLORS = {
  primary: 'text-primary-600',
  white:   'text-white',
  gray:    'text-gray-500',
};

export default function Spinner({
  size    = 'md',
  color   = 'primary',
  label   = 'Loading…',
  className = '',
}) {
  return (
    <span role="status" aria-label={label} className={`inline-flex ${className}`}>
      <svg
        className={`animate-spin ${SIZES[size] ?? SIZES.md} ${COLORS[color] ?? COLORS.primary}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
