import { supabase, isSupabaseConfigured } from './supabase'
import { getDemoCompletions, upsertDemoCompletion } from './demoData'

export async function getCompletions(userId, startDate, endDate) {
  if (!isSupabaseConfigured) {
    return getDemoCompletions().filter(
      c => c.completion_date >= startDate && c.completion_date <= endDate
    )
  }
  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('user_id', userId)
    .gte('completion_date', startDate)
    .lte('completion_date', endDate)
    .order('completion_date', { ascending: true })
  if (error) throw error
  return data
}

export async function getTodayCompletions(userId) {
  const today = new Date().toISOString().slice(0, 10)
  return getCompletions(userId, today, today)
}

export async function upsertCompletion({ habitId, userId, date, completed, progressValue = 0, notes = '' }) {
  if (!isSupabaseConfigured) {
    return upsertDemoCompletion({ habitId, date, completed, progressValue })
  }
  const { data, error } = await supabase
    .from('habit_completions')
    .upsert(
      {
        habit_id: habitId,
        user_id: userId,
        completion_date: date,
        completed,
        progress_value: progressValue,
        notes,
      },
      { onConflict: 'habit_id,completion_date' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCompletion(id) {
  if (!isSupabaseConfigured) return
  const { error } = await supabase
    .from('habit_completions')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getCompletionsForHabit(habitId) {
  if (!isSupabaseConfigured) {
    return getDemoCompletions().filter(c => c.habit_id === habitId && c.completed)
  }
  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('habit_id', habitId)
    .eq('completed', true)
    .order('completion_date', { ascending: false })
  if (error) throw error
  return data
}
