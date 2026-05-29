/**
 * ProgressBar — animated progress indicator.
 *
 * Props:
 *   value     (0-100)  current progress percentage
 *   label     string   optional label above the bar
 *   showValue boolean  show numeric percentage
 *   color     'primary' | 'emerald' | 'amber' | 'red'
 *   size      'sm' | 'md' | 'lg'
 *   animated  boolean  pulse animation on indeterminate state
 */

const TRACK_H = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
const BAR_COLORS = {
  primary: 'bg-primary-600',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  red:     'bg-red-500',
};

export default function ProgressBar({
  value     = 0,
  label,
  showValue = false,
  color     = 'primary',
  size      = 'md',
  animated  = false,
  className = '',
}) {
  const pct = Math.min(100, Math.max(0, value));
  const barColor = BAR_COLORS[color] ?? BAR_COLORS.primary;
  const trackH   = TRACK_H[size]    ?? TRACK_H.md;

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label    && <span className="text-xs font-medium text-gray-600">{label}</span>}
          {showValue && <span className="text-xs font-bold text-gray-700">{pct}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full ${trackH} bg-gray-100 rounded-full overflow-hidden`}
      >
        <div
          style={{ width: `${pct}%` }}
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${barColor}
            ${animated && pct < 100 ? 'animate-pulse' : ''}
          `}
        />
      </div>
    </div>
  );
}
