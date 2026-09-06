import { supabase } from './supabase'

// ─── Streak helpers ───────────────────────────────────────────────────────────

/**
 * Returns true if a given date (YYYY-MM-DD string) is scheduled
 * according to the habit's frequency.
 */
export function isScheduledDay(dateStr, habit) {
  const date = new Date(dateStr + 'T00:00:00')
  const dayOfWeek = date.getDay() // 0=Sun … 6=Sat
  switch (habit.frequency) {
    case 'daily':
      return true
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6
    case 'custom':
      return Array.isArray(habit.custom_days) && habit.custom_days.includes(dayOfWeek)
    default:
      return true
  }
}

/**
 * Given sorted completions (ascending) for one habit,
 * calculate current streak (as of today).
 */
export function calculateCurrentStreak(completions, habit) {
  const completedDates = new Set(
    completions.filter(c => c.completed).map(c => c.completion_date)
  )

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let cursor = new Date(today)

  // If today is not completed yet, allow it (don't break streak)
  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10)
    if (!isScheduledDay(dateStr, habit)) {
      cursor.setDate(cursor.getDate() - 1)
      continue
    }
    if (completedDates.has(dateStr)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else if (dateStr === today.toISOString().slice(0, 10)) {
      // Today not done yet — look back
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

/**
 * Calculate the longest streak ever for a habit.
 */
export function calculateLongestStreak(completions, habit) {
  const completedDates = new Set(
    completions.filter(c => c.completed).map(c => c.completion_date)
  )
  if (completedDates.size === 0) return 0

  const sorted = [...completedDates].sort()
  const start = new Date(sorted[0] + 'T00:00:00')
  const end = new Date()
  end.setHours(0, 0, 0, 0)

  let longestStreak = 0
  let currentStreak = 0
  let cursor = new Date(start)

  while (cursor <= end) {
    const dateStr = cursor.toISOString().slice(0, 10)
    if (!isScheduledDay(dateStr, habit)) {
      cursor.setDate(cursor.getDate() + 1)
      continue
    }
    if (completedDates.has(dateStr)) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return longestStreak
}

/**
 * Calculate completion rate: completed scheduled days / total scheduled days (past only).
 */
export function calculateCompletionRate(completions, habit, createdAt) {
  const completedDates = new Set(
    completions.filter(c => c.completed).map(c => c.completion_date)
  )

  const start = new Date(createdAt)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let scheduled = 0
  let completed = 0
  let cursor = new Date(start)

  while (cursor <= today) {
    const dateStr = cursor.toISOString().slice(0, 10)
    if (isScheduledDay(dateStr, habit)) {
      scheduled++
      if (completedDates.has(dateStr)) completed++
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100)
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export async function getAllAchievements() {
  const { data, error } = await supabase.from('achievements').select('*').order('requirement_value')
  if (error) throw error
  return data
}

export async function getUserAchievements(userId) {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*, achievements(*)')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export async function unlockAchievement(userId, achievementId) {
  const { error } = await supabase
    .from('user_achievements')
    .upsert({ user_id: userId, achievement_id: achievementId }, { onConflict: 'user_id,achievement_id' })
  if (error) throw error
}

// ─── Weekly chart data ────────────────────────────────────────────────────────

export function buildWeeklyChartData(habits, completions) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const dateStr = d.toISOString().slice(0, 10)
    const scheduled = habits.filter(h => isScheduledDay(dateStr, h))
    const completed = completions.filter(c => c.completion_date === dateStr && c.completed)
    days.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: dateStr,
      rate: scheduled.length ? Math.round((completed.length / scheduled.length) * 100) : 0,
      completed: completed.length,
      scheduled: scheduled.length,
    })
  }
  return days
}

export function buildMonthlyChartData(habits, completions, monthsBack = 1) {
  const result = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(today)
  start.setDate(today.getDate() - monthsBack * 30)

  let cursor = new Date(start)
  while (cursor <= today) {
    const dateStr = cursor.toISOString().slice(0, 10)
    const scheduled = habits.filter(h => isScheduledDay(dateStr, h))
    const completed = completions.filter(c => c.completion_date === dateStr && c.completed)
    result.push({
      date: dateStr,
      day: cursor.getDate(),
      rate: scheduled.length ? Math.round((completed.length / scheduled.length) * 100) : 0,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}
