/** Confidence badge — traffic light: Green ≥90%, Yellow 60–89%, Red <60% */
export default function ConfidenceBadge({ confidence }) {
  const pct = Math.round((confidence ?? 0) * 100);
  const { label, classes } =
    pct >= 90
      ? { label: 'High', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      : pct >= 60
      ? { label: 'Medium', classes: 'bg-amber-50 text-amber-700 border-amber-200' }
      : { label: 'Low', classes: 'bg-red-50 text-red-700 border-red-200' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${pct >= 90 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-500'}`} />
      {label} · {pct}%
    </span>
  );
}
