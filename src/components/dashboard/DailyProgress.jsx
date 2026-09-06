export default function DailyProgress({ completed, total, className = '' }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const msg =
    pct === 100 ? '🎉 Perfect day! All habits completed!' :
    pct >= 75  ? '💪 Almost there! Keep going!' :
    pct >= 50  ? '🔥 Great progress today!' :
    total > 0  ? '⚡ Start completing your habits!' : ''

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Daily Progress</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{msg}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{pct}%</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{completed}/{total} done</div>
        </div>
      </div>
      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-blue-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
