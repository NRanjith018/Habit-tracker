import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Flame, Trophy, Check, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getHabitById, updateHabit, deleteHabit } from '../services/habits'
import { getCompletionsForHabit, upsertCompletion } from '../services/completions'
import { calculateCurrentStreak, calculateLongestStreak, calculateCompletionRate } from '../services/statistics'
import HabitForm from '../components/habits/HabitForm'
import DeleteConfirmModal from '../components/habits/DeleteConfirmModal'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import ProgressBar from '../components/ui/ProgressBar'
import toast from 'react-hot-toast'

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function HabitDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [habit, setHabit] = useState(null)
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  const load = useCallback(async () => {
    try {
      const [h, c] = await Promise.all([
        getHabitById(id),
        getCompletionsForHabit(id),
      ])
      setHabit(h)
      setCompletions(c)
    } catch {
      toast.error('Failed to load habit details')
      navigate('/habits')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { load() }, [load])

  async function handleUpdate(formData) {
    setFormLoading(true)
    try {
      const updated = await updateHabit(id, formData)
      setHabit(updated)
      toast.success('Changes saved!')
      setEditOpen(false)
    } catch {
      toast.error('Failed to save changes.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await deleteHabit(id)
      toast.success('Habit deleted.')
      navigate('/habits')
    } catch {
      toast.error('Failed to delete habit.')
      setDeleteLoading(false)
    }
  }

  // Week overview (last 7 days)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    return d.toISOString().slice(0, 10)
  })
  const completedSet = new Set(completions.map(c => c.completion_date))

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }
  if (!habit) return null

  const streak = calculateCurrentStreak(completions, habit)
  const longest = calculateLongestStreak(completions, habit)
  const rate = calculateCompletionRate(completions, habit, habit.created_at)
  const todayCompletion = completions.find(c => c.completion_date === today)
  const completedToday = todayCompletion?.completed || false

  async function toggleToday() {
    const newDone = !completedToday
    // Optimistic
    setCompletions(prev => {
      const filtered = prev.filter(c => c.completion_date !== today)
      return [...filtered, {
        ...(todayCompletion || {}),
        habit_id: id,
        user_id: user.id,
        completion_date: today,
        completed: newDone,
        progress_value: newDone ? (habit.target_value || 0) : 0,
      }]
    })
    try {
      await upsertCompletion({ habitId: id, userId: user.id, date: today, completed: newDone, progressValue: newDone ? (habit.target_value || 0) : 0 })
    } catch {
      toast.error('Failed to update.')
      load()
    }
  }

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate('/habits')}
        className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Habits
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${habit.color}20`, border: `2px solid ${habit.color}40` }}
            >
              {habit.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{habit.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge label={habit.category} />
                <span className="text-xs text-slate-400 capitalize">{habit.frequency}</span>
              </div>
              {habit.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{habit.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
              <Edit2 size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30">
              <X size={14} />
            </Button>
          </div>
        </div>

        {/* Today's progress */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Today's Progress</span>
            <button
              onClick={toggleToday}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                completedToday
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100'
              }`}
            >
              <Check size={12} />
              {completedToday ? 'Completed' : 'Mark Done'}
            </button>
          </div>
          {habit.target_value && (
            <>
              <ProgressBar value={completedToday ? habit.target_value : 0} max={habit.target_value} color={completedToday ? 'green' : 'blue'} showLabel />
              <p className="text-xs text-slate-400 mt-1">
                {completedToday ? habit.target_value : 0} / {habit.target_value} {habit.target_unit}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { icon: <Flame className="text-orange-500" size={20} />, label: 'Current Streak', val: `${streak} days` },
          { icon: <Trophy className="text-yellow-500" size={20} />, label: 'Longest Streak', val: `${longest} days` },
          { icon: '📈', label: 'Completion Rate', val: `${rate}%` },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
            <div className="flex justify-center mb-2">
              {typeof s.icon === 'string' ? <span className="text-xl">{s.icon}</span> : s.icon}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{s.val}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly overview */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm mb-5">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Weekly Overview</h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(date => {
            const d = new Date(date + 'T00:00:00')
            const done = completedSet.has(date)
            const isToday = date === today
            return (
              <div key={date} className="flex flex-col items-center gap-1.5">
                <span className="text-xs text-slate-400">{DAYS_SHORT[d.getDay()]}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                  ${done ? 'bg-emerald-500 text-white' : isToday ? 'ring-2 ring-blue-400 text-blue-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                  {done ? <Check size={14} /> : d.getDate()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent completions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Completion History</h2>
        {completions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No completions yet. Start today!</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {completions.slice(0, 20).map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {new Date(c.completion_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                  {c.completed ? '✓ Done' : 'Missed'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Habit" size="lg">
        <HabitForm
          initial={habit}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          loading={formLoading}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        habitName={habit?.name}
        loading={deleteLoading}
      />
    </div>
  )
}
