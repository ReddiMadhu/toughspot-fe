/**
 * Card — surface container with optional title, subtitle, and action slot.
 *
 * Usage:
 *   <Card title="Section" subtitle="description">
 *     ...children
 *   </Card>
 */
export default function Card({
  children,
  title,
  subtitle,
  action,
  className = '',
  noPadding = false,
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0 ml-4">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : (title || action) ? 'px-5 pb-5' : 'p-5'}>
        {children}
      </div>
    </div>
  );
}
