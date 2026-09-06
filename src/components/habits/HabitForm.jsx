import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

const CATEGORIES = ['Health', 'Fitness', 'Study', 'Work', 'Personal', 'Finance', 'Other']
const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekends', label: 'Weekends (Sat–Sun)' },
  { value: 'custom', label: 'Custom days' },
]
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const ICONS = ['🎯', '💪', '📚', '🏃', '💧', '🧘', '🍎', '✍️', '🎵', '🛌', '🧹', '💊', '🏋️', '🚴', '🤸', '📝', '💰', '🌱', '🦷', '🧠']
const COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
  '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1',
]

const defaultForm = {
  name: '',
  description: '',
  category: 'Health',
  frequency: 'daily',
  custom_days: [],
  target_value: '',
  target_unit: '',
  reminder_time: '',
  icon: '🎯',
  color: '#3B82F6',
}

export default function HabitForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial })
  const [errors, setErrors] = useState({})

  function set(key, val) {
    setForm(p => ({ ...p, [key]: val }))
  }

  function toggleDay(d) {
    set('custom_days', form.custom_days.includes(d)
      ? form.custom_days.filter(x => x !== d)
      : [...form.custom_days, d]
    )
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Habit name is required'
    if (form.target_value && isNaN(Number(form.target_value))) errs.target_value = 'Must be a number'
    if (form.target_value && Number(form.target_value) <= 0) errs.target_value = 'Must be a positive number'
    if (form.frequency === 'custom' && form.custom_days.length === 0) errs.custom_days = 'Select at least one day'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit({
      ...form,
      target_value: form.target_value ? Number(form.target_value) : null,
      custom_days: form.frequency === 'custom' ? form.custom_days : null,
      reminder_time: form.reminder_time || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <Input
        label="Habit name *"
        id="habit-name"
        placeholder="e.g. Morning Run"
        value={form.name}
        onChange={e => set('name', e.target.value)}
        error={errors.name}
      />

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Description <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Why is this habit important to you?"
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              type="button"
              key={cat}
              onClick={() => set('category', cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                form.category === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-blue-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Frequency</label>
        <select
          value={form.frequency}
          onChange={e => set('frequency', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Custom days */}
      {form.frequency === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select days</label>
          <div className="flex gap-2">
            {DAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(i)}
                className={`w-10 h-10 rounded-xl text-xs font-medium border transition-all ${
                  form.custom_days.includes(i)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                }`}
              >
                {d.slice(0, 2)}
              </button>
            ))}
          </div>
          {errors.custom_days && <p className="text-xs text-red-500 mt-1">{errors.custom_days}</p>}
        </div>
      )}

      {/* Target */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Target value"
          id="target-value"
          type="number"
          min="0"
          placeholder="e.g. 30"
          value={form.target_value}
          onChange={e => set('target_value', e.target.value)}
          error={errors.target_value}
        />
        <Input
          label="Unit"
          id="target-unit"
          placeholder="e.g. minutes, pages"
          value={form.target_unit}
          onChange={e => set('target_unit', e.target.value)}
        />
      </div>

      {/* Reminder */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Reminder time <span className="text-slate-400">(optional)</span>
        </label>
        <input
          type="time"
          value={form.reminder_time}
          onChange={e => set('reminder_time', e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Icon picker */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Icon</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(ic => (
            <button
              key={ic}
              type="button"
              onClick={() => set('icon', ic)}
              className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition-all ${
                form.icon === ic ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm' : 'border-slate-200 dark:border-slate-600 hover:border-blue-300'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('color', c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                form.color === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={loading}>
          {initial ? 'Save Changes' : 'Create Habit'}
        </Button>
      </div>
    </form>
  )
}
