import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getHabits } from '../services/habits'
import { getCompletions, getCompletionsForHabit } from '../services/completions'
import {
  buildWeeklyChartData, buildMonthlyChartData,
  calculateCurrentStreak, calculateLongestStreak, calculateCompletionRate
} from '../services/statistics'
import WeeklyBarChart from '../components/charts/WeeklyBarChart'
import MonthlyLineChart from '../components/charts/MonthlyLineChart'
import { SkeletonCard } from '../components/ui/Skeleton'
import { Skeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const PERIODS = [
  { label: 'Week', months: 0, days: 7 },
  { label: 'Month', months: 1, days: 30 },
  { label: '3 Months', months: 3, days: 90 },
  { label: 'Year', months: 12, days: 365 },
]

export default function Statistics() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])
  const [allCompletions, setAllCompletions] = useState([])
  const [habitStats, setHabitStats] = useState([])
  const [period, setPeriod] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const habitData = await getHabits(user.id)
      setHabits(habitData)

      // Load completions for a wide range (1 year)
      const start = new Date()
      start.setFullYear(start.getFullYear() - 1)
      const startStr = start.toISOString().slice(0, 10)
      const endStr = new Date().toISOString().slice(0, 10)

      const comps = await getCompletions(user.id, startStr, endStr)
      setAllCompletions(comps)

      // Per-habit stats
      const stats = await Promise.all(habitData.map(async h => {
        const hc = comps.filter(c => c.habit_id === h.id)
        return {
          habit: h,
          streak: calculateCurrentStreak(hc, h),
          longest: calculateLongestStreak(hc, h),
          rate: calculateCompletionRate(hc, h, h.created_at),
        }
      }))
      setHabitStats(stats)
    } catch {
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => { load() }, [load])

  const selectedPeriod = PERIODS[period]
  const weeklyData = buildWeeklyChartData(habits, allCompletions)
  const monthlyData = buildMonthlyChartData(habits, allCompletions, selectedPeriod.months || 1)

  const overallRate = habitStats.length > 0
    ? Math.round(habitStats.reduce((s, h) => s + h.rate, 0) / habitStats.length)
    : 0

  const maxStreak = habitStats.length > 0 ? Math.max(...habitStats.map(s => s.streak)) : 0
  const maxLongest = habitStats.length > 0 ? Math.max(...habitStats.map(s => s.longest)) : 0
  const totalDone = allCompletions.filter(c => c.completed).length

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="No statistics yet"
        description="Create habits and start completing them to see your progress here."
        actionLabel="Create a Habit"
        onAction={() => navigate('/habits')}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Statistics</h1>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {PERIODS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPeriod(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === i ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Avg Completion', value: `${overallRate}%`, icon: '📈' },
          { label: 'Current Streak', value: `${maxStreak}d`, icon: '🔥' },
          { label: 'Longest Streak', value: `${maxLongest}d`, icon: '🏆' },
          { label: 'Total Completions', value: totalDone, icon: '✓' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm mb-5">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Weekly Completion Rate</h2>
        <WeeklyBarChart data={weeklyData} />
      </div>

      {/* Monthly chart */}
      {period > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm mb-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Progress Over Time</h2>
          <MonthlyLineChart data={monthlyData} />
        </div>
      )}

      {/* Per-habit comparison */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm mb-5">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Habit Comparison</h2>
        <div className="space-y-4">
          {[...habitStats].sort((a, b) => b.rate - a.rate).map(({ habit, rate, streak }) => (
            <div key={habit.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{habit.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{habit.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{rate}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${rate}%`, backgroundColor: habit.color }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">🔥 {streak} day streak</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements preview */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Your Journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: '🌱', label: 'First Habit', done: habits.length >= 1 },
            { icon: '🔥', label: '7-Day Streak', done: maxStreak >= 7 },
            { icon: '💯', label: '10 Completions', done: totalDone >= 10 },
            { icon: '🏆', label: '30-Day Streak', done: maxStreak >= 30 },
            { icon: '⭐', label: '100 Completions', done: totalDone >= 100 },
            { icon: '🎯', label: '5 Habits', done: habits.length >= 5 },
          ].map(a => (
            <div key={a.label} className={`rounded-xl p-3 text-center transition-all ${a.done ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 opacity-50'}`}>
              <div className="text-2xl mb-1">{a.icon}</div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{a.label}</p>
              {a.done && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">Unlocked!</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
