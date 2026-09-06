import { Link } from 'react-router-dom'
import { Edit2, Trash2, Flame } from 'lucide-react'
import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'

export default function HabitCard({ habit, streak, completionRate, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <Link to={`/habits/${habit.id}`} className="shrink-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${habit.color}20`, border: `2px solid ${habit.color}40` }}
          >
            {habit.icon}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/habits/${habit.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate text-sm">
              {habit.name}
            </Link>
            <Badge label={habit.category} className="shrink-0" />
          </div>

          {habit.target_value && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Target: {habit.target_value} {habit.target_unit}
            </p>
          )}

          <div className="flex items-center gap-4 mb-2">
            <span className="flex items-center gap-1 text-xs text-orange-500">
              <Flame size={12} />
              {streak} day streak
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {completionRate}% completion
            </span>
          </div>

          <ProgressBar value={completionRate} max={100} color="blue" />
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            aria-label="Edit habit"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            aria-label="Delete habit"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
