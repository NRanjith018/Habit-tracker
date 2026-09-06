import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getHabits, createHabit, updateHabit, deleteHabit } from '../services/habits'
import { getCompletionsForHabit } from '../services/completions'
import { calculateCurrentStreak, calculateCompletionRate } from '../services/statistics'
import HabitCard from '../components/habits/HabitCard'
import HabitForm from '../components/habits/HabitForm'
import DeleteConfirmModal from '../components/habits/DeleteConfirmModal'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonList } from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function Habits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [stats, setStats] = useState({}) // habitId -> { streak, rate }
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editHabit, setEditHabit] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const loadHabits = useCallback(async () => {
    try {
      const data = await getHabits(user.id)
      setHabits(data)
      // Load stats for each habit
      const statsMap = {}
      await Promise.all(data.map(async h => {
        const completions = await getCompletionsForHabit(h.id)
        statsMap[h.id] = {
          streak: calculateCurrentStreak(completions, h),
          rate: calculateCompletionRate(completions, h, h.created_at),
        }
      }))
      setStats(statsMap)
    } catch {
      toast.error('Failed to load habits')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => { loadHabits() }, [loadHabits])

  async function handleCreate(formData) {
    setFormLoading(true)
    try {
      await createHabit({ ...formData, user_id: user.id })
      toast.success('Habit created successfully! 🎯')
      setShowAdd(false)
      loadHabits()
    } catch {
      toast.error('Failed to create habit. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleUpdate(formData) {
    setFormLoading(true)
    try {
      await updateHabit(editHabit.id, formData)
      toast.success('Changes saved!')
      setEditHabit(null)
      loadHabits()
    } catch {
      toast.error('Failed to save changes.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await deleteHabit(deleteTarget.id)
      toast.success('Habit deleted.')
      setDeleteTarget(null)
      loadHabits()
    } catch {
      toast.error('Failed to delete habit.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const displayed = habits.filter(h => {
    if (filter === 'all') return true
    if (filter === 'active') return h.is_active
    return !h.is_active
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Habits</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{habits.length} habit{habits.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          Add Habit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'active'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {f === 'all' ? 'All' : 'Active'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <SkeletonList count={4} />
      ) : displayed.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No habits yet"
          description="Start with one small habit today. Consistency is key!"
          actionLabel="+ Create Your First Habit"
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <div className="space-y-3">
          {displayed.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={stats[habit.id]?.streak || 0}
              completionRate={stats[habit.id]?.rate || 0}
              onEdit={() => setEditHabit(habit)}
              onDelete={() => setDeleteTarget(habit)}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Habit" size="lg">
        <HabitForm
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editHabit} onClose={() => setEditHabit(null)} title="Edit Habit" size="lg">
        {editHabit && (
          <HabitForm
            initial={editHabit}
            onSubmit={handleUpdate}
            onCancel={() => setEditHabit(null)}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        habitName={deleteTarget?.name}
        loading={deleteLoading}
      />
    </div>
  )
}
