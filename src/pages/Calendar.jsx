import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getHabits } from '../services/habits'
import { getCompletions } from '../services/completions'
import { isScheduledDay } from '../services/statistics'
import { Skeleton } from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export default function Calendar() {
  const { user } = useAuth()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(getDaysInMonth(year, month)).padStart(2, '0')}`
      const [h, c] = await Promise.all([
        getHabits(user.id),
        getCompletions(user.id, startDate, endDate),
      ])
      setHabits(h)
      setCompletions(c)
    } catch {
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }, [user.id, year, month])

  useEffect(() => { loadData() }, [loadData])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = now.toISOString().slice(0, 10)

  function getDayStatus(day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (dateStr > today) return 'future'
    const scheduled = habits.filter(h => isScheduledDay(dateStr, h))
    if (scheduled.length === 0) return 'none'
    const done = completions.filter(c => c.completion_date === dateStr && c.completed)
    if (done.length === 0) return 'missed'
    if (done.length === scheduled.length) return 'full'
    return 'partial'
  }

  function getDayCompletions(dateStr) {
    const scheduled = habits.filter(h => isScheduledDay(dateStr, h))
    return scheduled.map(h => ({
      habit: h,
      done: completions.some(c => c.completion_date === dateStr && c.habit_id === h.id && c.completed),
    }))
  }

  const statusColors = {
    future:  'text-slate-400 dark:text-slate-500',
    none:    'text-slate-400 dark:text-slate-500',
    missed:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    partial: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    full:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  }

  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Calendar</h1>

      <div className={`lg:flex gap-6 ${selectedDate ? '' : ''}`}>
        {/* Calendar */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm mb-5 lg:mb-0">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-semibold text-slate-900 dark:text-white">{monthName}</h2>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors" disabled={`${year}-${String(month + 1).padStart(2,'0')}` >= `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const status = getDayStatus(day)
                const isToday = dateStr === today
                const isSelected = selectedDate === dateStr
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`
                      h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                      ${statusColors[status]}
                      ${isToday ? 'ring-2 ring-blue-400' : ''}
                      ${isSelected ? 'ring-2 ring-blue-600 scale-105' : ''}
                      ${status !== 'future' && status !== 'none' ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
            {[
              { color: 'bg-emerald-500', label: 'All done' },
              { color: 'bg-yellow-400', label: 'Partial' },
              { color: 'bg-red-400', label: 'Missed' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Day panel */}
        {selectedDate && (
          <div className="lg:w-72 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {getDayCompletions(selectedDate).length === 0 ? (
              <p className="text-sm text-slate-400">No habits scheduled.</p>
            ) : (
              <div className="space-y-2">
                {getDayCompletions(selectedDate).map(({ habit, done }) => (
                  <div key={habit.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: `${habit.color}20` }}>
                      {habit.icon}
                    </div>
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">{habit.name}</span>
                    {done
                      ? <Check size={14} className="text-emerald-500 shrink-0" />
                      : <X size={14} className="text-red-400 shrink-0" />
                    }
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
