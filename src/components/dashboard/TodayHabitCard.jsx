import { Check } from 'lucide-react'
import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'

export default function TodayHabitCard({ habit, completion, onToggle }) {
  const done = completion?.completed || false
  const progress = completion?.progress_value || 0
  const pct = habit.target_value ? Math.min(100, (progress / habit.target_value) * 100) : (done ? 100 : 0)

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border transition-all duration-200
        ${done
          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10'
          : 'border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'
        }`}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: `${habit.color}20`, border: `2px solid ${habit.color}40` }}
        >
          {habit.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-sm truncate ${done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
              {habit.name}
            </h3>
            <Badge label={habit.category} className="shrink-0" />
          </div>
          {habit.target_value && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Target: {habit.target_value} {habit.target_unit}
            </p>
          )}
          <ProgressBar value={pct} max={100} color={done ? 'green' : 'blue'} showLabel />
        </div>

        {/* Complete button */}
        <button
          onClick={onToggle}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
            ${done
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/30'
              : 'border-2 border-slate-200 dark:border-slate-600 text-transparent hover:border-blue-400 hover:text-blue-400'
            }`}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        >
          <Check size={18} />
        </button>
      </div>
    </div>
  )
}
