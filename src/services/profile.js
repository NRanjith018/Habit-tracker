import { supabase, isSupabaseConfigured } from './supabase'
import { DEMO_PROFILE } from './demoData'

export async function getProfile(userId) {
  if (!isSupabaseConfigured) return { ...DEMO_PROFILE }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  if (!isSupabaseConfigured) return { ...DEMO_PROFILE, ...updates }
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadAvatar(userId, file) {
  if (!isSupabaseConfigured) {
    // In demo mode, create a local object URL for preview
    return URL.createObjectURL(file)
  }
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
