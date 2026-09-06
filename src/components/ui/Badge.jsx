const categoryColors = {
  Health:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  Fitness:  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  Study:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  Work:     'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  Personal: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400',
  Finance:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  Other:    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

export default function Badge({ label, className = '' }) {
  const colorClass = categoryColors[label] || categoryColors.Other
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  )
}
