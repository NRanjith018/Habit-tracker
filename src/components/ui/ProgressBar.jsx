export default function ProgressBar({ value = 0, max = 100, color = 'blue', className = '', showLabel = false }) {
  const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0))
  const colorMap = {
    blue:   'bg-blue-500',
    green:  'bg-emerald-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red:    'bg-red-500',
  }
  const barColor = colorMap[color] || 'bg-blue-500'
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-8 text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
}
