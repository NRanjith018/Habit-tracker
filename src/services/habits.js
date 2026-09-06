import { supabase, isSupabaseConfigured } from './supabase'
import { getDemoHabits, addDemoHabit, updateDemoHabit, deleteDemoHabit } from './demoData'

export async function getHabits(userId) {
  if (!isSupabaseConfigured) return getDemoHabits().filter(h => h.is_active)
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getHabitById(id) {
  if (!isSupabaseConfigured) {
    const h = getDemoHabits().find(h => h.id === id)
    if (!h) throw new Error('Habit not found')
    return h
  }
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createHabit(habitData) {
  if (!isSupabaseConfigured) return addDemoHabit(habitData)
  const { data, error } = await supabase
    .from('habits')
    .insert(habitData)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateHabit(id, updates) {
  if (!isSupabaseConfigured) return updateDemoHabit(id, updates)
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteHabit(id) {
  if (!isSupabaseConfigured) return deleteDemoHabit(id)
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function archiveHabit(id) {
  return updateHabit(id, { is_active: false })
}
