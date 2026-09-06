import { supabase } from './supabase'

export async function getHabits(userId) {
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
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createHabit(habitData) {
  const { data, error } = await supabase
    .from('habits')
    .insert(habitData)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateHabit(id, updates) {
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
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function archiveHabit(id) {
  return updateHabit(id, { is_active: false })
}
