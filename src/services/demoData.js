// ─── Demo mode data ───────────────────────────────────────────────────────────
// Used when Supabase credentials are not configured, so the full UI can be
// previewed with realistic sample data.

export const DEMO_EMAIL = 'demo@habittracker.com'
export const DEMO_PASSWORD = 'Demo1234'

export const DEMO_USER = {
  id: 'demo-user-001',
  email: DEMO_EMAIL,
  created_at: '2025-06-01T00:00:00Z',
  user_metadata: { full_name: 'Alex Johnson' },
}

export const DEMO_PROFILE = {
  id: 'demo-user-001',
  full_name: 'Alex Johnson',
  email: DEMO_EMAIL,
  avatar_url: null,
  created_at: '2025-06-01T00:00:00Z',
  updated_at: new Date().toISOString(),
}

// Generate dates relative to today
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const today = daysAgo(0)

export const DEMO_HABITS = [
  {
    id: 'h1', user_id: 'demo-user-001', name: 'Morning Run', description: 'Run for 30 minutes every morning',
    category: 'Fitness', frequency: 'daily', custom_days: null, target_value: 30, target_unit: 'minutes',
    reminder_time: '06:30', icon: '🏃', color: '#10B981', is_active: true,
    created_at: '2025-07-01T00:00:00Z', updated_at: today,
  },
  {
    id: 'h2', user_id: 'demo-user-001', name: 'Read a Book', description: 'Read at least 20 pages',
    category: 'Study', frequency: 'daily', custom_days: null, target_value: 20, target_unit: 'pages',
    reminder_time: '21:00', icon: '📚', color: '#3B82F6', is_active: true,
    created_at: '2025-07-15T00:00:00Z', updated_at: today,
  },
  {
    id: 'h3', user_id: 'demo-user-001', name: 'Drink Water', description: 'Stay hydrated throughout the day',
    category: 'Health', frequency: 'daily', custom_days: null, target_value: 3, target_unit: 'litres',
    reminder_time: '08:00', icon: '💧', color: '#06B6D4', is_active: true,
    created_at: '2025-08-01T00:00:00Z', updated_at: today,
  },
  {
    id: 'h4', user_id: 'demo-user-001', name: 'DSA Practice', description: 'Solve coding problems',
    category: 'Study', frequency: 'weekdays', custom_days: null, target_value: 3, target_unit: 'problems',
    reminder_time: '10:00', icon: '🧠', color: '#8B5CF6', is_active: true,
    created_at: '2025-08-10T00:00:00Z', updated_at: today,
  },
  {
    id: 'h5', user_id: 'demo-user-001', name: 'Meditation', description: 'Mindfulness and breathing',
    category: 'Personal', frequency: 'daily', custom_days: null, target_value: 15, target_unit: 'minutes',
    reminder_time: '07:00', icon: '🧘', color: '#EC4899', is_active: true,
    created_at: '2025-08-20T00:00:00Z', updated_at: today,
  },
]

// Generate completions for the last 45 days with realistic patterns
function generateCompletions() {
  const completions = []
  let id = 1

  for (let dayOffset = 45; dayOffset >= 0; dayOffset--) {
    const dateStr = daysAgo(dayOffset)
    const date = new Date(dateStr + 'T00:00:00')
    const dayOfWeek = date.getDay()

    for (const habit of DEMO_HABITS) {
      // Skip if habit didn't exist yet
      if (dateStr < habit.created_at.slice(0, 10)) continue

      // Skip weekends for weekday-only habits
      if (habit.frequency === 'weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) continue

      // Simulate realistic completion patterns (~75-90% completion)
      const rand = Math.random()
      let completed = false

      if (dayOffset === 0) {
        // Today: only some completed (so user can see partial progress)
        completed = habit.id === 'h1' || habit.id === 'h3' // Run + Water done today
      } else if (dayOffset <= 3) {
        completed = rand < 0.85 // last few days: 85% chance
      } else if (dayOffset <= 14) {
        completed = rand < 0.78 // last 2 weeks: 78%
      } else {
        completed = rand < 0.65 // older: 65%
      }

      completions.push({
        id: `c${id++}`,
        habit_id: habit.id,
        user_id: 'demo-user-001',
        completion_date: dateStr,
        completed,
        progress_value: completed ? habit.target_value : 0,
        notes: '',
        created_at: dateStr + 'T12:00:00Z',
      })
    }
  }

  return completions
}

// Generate once and cache
let _cachedCompletions = null
export function getDemoCompletions() {
  if (!_cachedCompletions) _cachedCompletions = generateCompletions()
  return _cachedCompletions
}

export function resetDemoCompletions() {
  _cachedCompletions = null
}

// ─── Demo storage helpers ─────────────────────────────────────────────────────
// These simulate real-time state changes for the demo session.

let _demoHabits = [...DEMO_HABITS]

export function getDemoHabits() {
  return [..._demoHabits]
}

export function addDemoHabit(data) {
  const habit = {
    ...data,
    id: 'h' + Date.now(),
    user_id: 'demo-user-001',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  _demoHabits.push(habit)
  return habit
}

export function updateDemoHabit(id, updates) {
  const idx = _demoHabits.findIndex(h => h.id === id)
  if (idx >= 0) {
    _demoHabits[idx] = { ..._demoHabits[idx], ...updates, updated_at: new Date().toISOString() }
    return _demoHabits[idx]
  }
  return null
}

export function deleteDemoHabit(id) {
  _demoHabits = _demoHabits.filter(h => h.id !== id)
}

export function upsertDemoCompletion({ habitId, date, completed, progressValue }) {
  const comps = getDemoCompletions()
  const idx = comps.findIndex(c => c.habit_id === habitId && c.completion_date === date)
  const entry = {
    id: idx >= 0 ? comps[idx].id : 'c' + Date.now(),
    habit_id: habitId,
    user_id: 'demo-user-001',
    completion_date: date,
    completed,
    progress_value: progressValue || 0,
    notes: '',
    created_at: new Date().toISOString(),
  }
  if (idx >= 0) comps[idx] = entry
  else comps.push(entry)
  return entry
}
