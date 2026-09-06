import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Flame, Trophy, TrendingUp, Target, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getHabits } from '../services/habits'
import { getTodayCompletions, upsertCompletion } from '../services/completions'
import { calculateCurrentStreak, calculateLongestStreak, isScheduledDay } from '../services/statistics'
import { SkeletonCard, SkeletonList } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import TodayHabitCard from '../components/dashboard/TodayHabitCard'
import StatCard from '../components/dashboard/StatCard'
import DailyProgress from '../components/dashboard/DailyProgress'
import toast from 'react-hot-toast'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().slice(0, 10)

  const load = useCallback(async () => {
    try {
      const [h, c] = await Promise.all([
        getHabits(user.id),
        getTodayCompletions(user.id),
      ])
      setHabits(h)
      setCompletions(c)
    } catch {
      toast.error('Failed to load habits')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => { load() }, [load])

  // Habits scheduled for today
  const todaysHabits = habits.filter(h => isScheduledDay(today, h))

  // Completion map: habitId → completion record
  const completionMap = {}
  completions.forEach(c => { completionMap[c.habit_id] = c })

  const completedToday = todaysHabits.filter(h => completionMap[h.id]?.completed).length

  async function toggleCompletion(habit) {
    const existing = completionMap[habit.id]
    const wasCompleted = existing?.completed || false
    const newCompleted = !wasCompleted

    // Optimistic update
    setCompletions(prev => {
      const filtered = prev.filter(c => c.habit_id !== habit.id)
      return [...filtered, {
        ...(existing || {}),
        habit_id: habit.id,
        user_id: user.id,
        completion_date: today,
        completed: newCompleted,
        progress_value: newCompleted ? (habit.target_value || 0) : 0,
      }]
    })

    try {
      await upsertCompletion({
        habitId: habit.id,
        userId: user.id,
        date: today,
        completed: newCompleted,
        progressValue: newCompleted ? (habit.target_value || 0) : 0,
      })
      if (newCompleted) toast.success(`✓ ${habit.name} completed!`)
    } catch {
      // Rollback
      setCompletions(prev => {
        const filtered = prev.filter(c => c.habit_id !== habit.id)
        return existing ? [...filtered, existing] : filtered
      })
      toast.error('Failed to update habit. Please try again.')
    }
  }

  // Global stats from all habits completions would require more data;
  // for dashboard show simplified current stats
  const currentStreak = habits.length > 0
    ? Math.max(0, ...habits.map(h => calculateCurrentStreak(
        completions.filter(c => c.habit_id === h.id), h
      )))
    : 0

  const name = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {getGreeting()}, {name}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Flame className="text-orange-500" size={22} />} label="Current Streak" value={`${currentStreak} days`} bg="bg-orange-50 dark:bg-orange-900/20" />
          <StatCard icon={<Trophy className="text-yellow-500" size={22} />} label="Total Habits" value={habits.length} bg="bg-yellow-50 dark:bg-yellow-900/20" />
          <StatCard icon={<TrendingUp className="text-blue-500" size={22} />} label="Completed Today" value={`${completedToday} / ${todaysHabits.length}`} bg="bg-blue-50 dark:bg-blue-900/20" />
          <StatCard icon={<Target className="text-purple-500" size={22} />} label="Today's Rate" value={todaysHabits.length ? `${Math.round((completedToday / todaysHabits.length) * 100)}%` : '—'} bg="bg-purple-50 dark:bg-purple-900/20" />
        </div>
      )}

      {/* Daily progress */}
      {!loading && todaysHabits.length > 0 && (
        <DailyProgress completed={completedToday} total={todaysHabits.length} className="mb-8" />
      )}

      {/* Today's habits */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Today's Habits</h2>
        <Button size="sm" onClick={() => navigate('/habits')}>
          <Plus size={14} />
          Add Habit
        </Button>
      </div>

      {loading ? (
        <SkeletonList count={3} />
      ) : todaysHabits.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No habits scheduled for today"
          description="Create your first habit and start building a consistent routine."
          actionLabel="+ Create Your First Habit"
          onAction={() => navigate('/habits')}
        />
      ) : (
        <div className="space-y-3">
          {todaysHabits.map(habit => (
            <TodayHabitCard
              key={habit.id}
              habit={habit}
              completion={completionMap[habit.id]}
              onToggle={() => toggleCompletion(habit)}
            />
          ))}
        </div>
      )}

      {/* Quick nav */}
      {!loading && habits.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'View Calendar', to: '/calendar', icon: '📅' },
            { label: 'See Statistics', to: '/statistics', icon: '📊' },
            { label: 'Manage Habits', to: '/habits', icon: '✓' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
